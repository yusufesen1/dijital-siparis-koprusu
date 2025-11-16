const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /siparisler  (duruma ve/veya bayi_id'ye göre listele)
router.get("/", (req, res) => {
  const { durum, bayi_id } = req.query;

  let sql = `
    SELECT 
      s.*,
      b.bayi_adi
    FROM siparisler s
    LEFT JOIN bayiler b ON s.bayi_id = b.bayi_id
  `;

  const where = [];
  const params = [];

  if (durum && durum !== "Tümü") {
    where.push("s.durum = ?");
    params.push(durum);
  }

  if (bayi_id) {
    where.push("s.bayi_id = ?");
    params.push(bayi_id);
  }

  if (where.length > 0) {
    sql += " WHERE " + where.join(" AND ");
  }

  sql += " ORDER BY s.tarih DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ Veritabanı hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});

// POST /siparisler/olustur - Yeni sipariş oluştur (sepet detaylarıyla birlikte)
router.post("/olustur", (req, res) => {
  const { bayi_id, sepet, toplam_tutar, teslimat_tarihi } = req.body;
  const tarih = new Date();
  const durum = "Onay Bekliyor";

  // 1. Önce siparis tablosuna ekle
  const siparisSql = `
    INSERT INTO siparisler (bayi_id, durum, toplam_tutar, tarih, teslimat_tarihi)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(siparisSql, [bayi_id, durum, toplam_tutar, tarih, teslimat_tarihi], (err, siparisResult) => {
    if (err) {
      console.error("❌ Sipariş eklenemedi:", err);
      return res.status(500).json({ error: "Sipariş eklenemedi" });
    }

    const siparisId = siparisResult.insertId;

    // 2. Sepetteki her ürün için siparis_detay tablosuna ekle
    if (!sepet || sepet.length === 0) {
      return res.status(201).json({
        message: "Sipariş oluşturuldu (detay yok)",
        siparis_id: siparisId
      });
    }

    let detayEklenenSayisi = 0;
    let hatalar = [];

    sepet.forEach((item, index) => {
      // Önce ürünün ID'sini bul
      const urunBulSql = "SELECT urun_id FROM urunler WHERE urun_adi = ? LIMIT 1";

      db.query(urunBulSql, [item.product], (err, urunler) => {
        if (err || !urunler || urunler.length === 0) {
          console.error(`❌ Ürün bulunamadı: ${item.product}`);
          hatalar.push(`Ürün bulunamadı: ${item.product}`);
          detayEklenenSayisi++;
          kontrol();
          return;
        }

        const urunId = urunler[0].urun_id;

        // siparis_detay tablosuna ekle
        const detaySql = `
          INSERT INTO siparis_detay (siparis_id, urun_id, miktar)
          VALUES (?, ?, ?)
        `;

        db.query(detaySql, [siparisId, urunId, item.quantity], (err) => {
          if (err) {
            console.error("❌ Sipariş detayı eklenemedi:", err);
            hatalar.push(`Detay eklenemedi: ${item.product}`);
          }
          detayEklenenSayisi++;
          kontrol();
        });
      });
    });

    function kontrol() {
      if (detayEklenenSayisi === sepet.length) {
        if (hatalar.length > 0) {
          res.status(201).json({
            message: "Sipariş oluşturuldu ancak bazı detaylar eklenemedi",
            siparis_id: siparisId,
            hatalar: hatalar
          });
        } else {
          res.status(201).json({
            message: "Sipariş başarıyla oluşturuldu",
            siparis_id: siparisId
          });
        }
      }
    }
  });
});

// POST /siparisler  (basit versiyon - geriye dönük uyumluluk için)
router.post("/", (req, res) => {
  const { bayi_id, durum, toplam_tutar } = req.body;
  const tarih = new Date();

  const sql = `
    INSERT INTO siparisler (bayi_id, durum, toplam_tutar, tarih)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [bayi_id, durum, toplam_tutar, tarih], (err, result) => {
    if (err) {
      console.error("❌ Sipariş eklenemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.status(201).json({ message: "Sipariş eklendi", id: result.insertId });
  });
});

// PUT /siparisler/:id/durum  (durum güncelle)
router.put("/:id/durum", (req, res) => {
  const { durum } = req.body;
  const id = req.params.id;

  const sql = "UPDATE siparisler SET durum = ? WHERE siparis_id = ?";

  db.query(sql, [durum, id], (err, result) => {
    if (err) {
      console.error("❌ Durum güncellenemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json({ message: "Durum güncellendi" });
  });
});

// GET /siparisler/:id/detay  (sipariş detaylarını getir)
router.get("/:id/detay", (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT
      sd.siparis_id,
      sd.urun_id,
      u.urun_adi,
      u.urun_tip,
      u.birim,
      sd.miktar
    FROM siparis_detay sd
    LEFT JOIN urunler u ON sd.urun_id = u.urun_id
    WHERE sd.siparis_id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Sipariş detayları alınamadı:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});

// GET /siparisler/en-cok-siparis-edilen-urunler?bayi_id=X (en çok sipariş edilen ürünleri getir)
router.get("/en-cok-siparis-edilen-urunler", (req, res) => {
  const { bayi_id } = req.query;

  if (!bayi_id) {
    return res.status(400).json({ error: "bayi_id parametresi gerekli" });
  }

  const sql = `
    SELECT
      u.urun_adi,
      SUM(sd.miktar) as toplam_miktar
    FROM siparis_detay sd
    JOIN siparisler s ON sd.siparis_id = s.siparis_id
    JOIN urunler u ON sd.urun_id = u.urun_id
    WHERE s.bayi_id = ?
    GROUP BY u.urun_id, u.urun_adi
    ORDER BY toplam_miktar DESC
    LIMIT 5
  `;

  db.query(sql, [bayi_id], (err, results) => {
    if (err) {
      console.error("❌ En çok sipariş edilen ürünler alınamadı:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});

// GET /siparisler/haftalik-trend?bayi_id=X (son 7 günün sipariş trendini getir)
router.get("/haftalik-trend", (req, res) => {
  const { bayi_id } = req.query;

  if (!bayi_id) {
    return res.status(400).json({ error: "bayi_id parametresi gerekli" });
  }

  const sql = `
    SELECT
      DATE(tarih) as gun,
      COUNT(*) as siparis_sayisi
    FROM siparisler
    WHERE bayi_id = ? AND tarih >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DATE(tarih)
    ORDER BY gun ASC
  `;

  db.query(sql, [bayi_id], (err, results) => {
    if (err) {
      console.error("❌ Haftalık trend alınamadı:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});

module.exports = router;


