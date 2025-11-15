const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ 1. ÖZET BİLGİLER
router.get("/ozet", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM siparisler) AS toplam_siparis,
      (SELECT COUNT(*) FROM bayiler) AS aktif_bayiler,
      (SELECT COUNT(*) FROM hammadde WHERE stok_miktari < (kritik_stok_seviyesi * 0.6)) AS kritik_stoklar,
      (SELECT COUNT(*) FROM siparisler WHERE durum = 'Tamamlandı') AS sevkiyat_durumu
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Veritabanı hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results[0]);
  });
});


// ✅ 2. ŞEHİR BAZLI SİPARİŞLER
router.get("/sehir-siparis", (req, res) => {
  const sql = `
    SELECT 
      b.sehir AS sehir,
      COUNT(s.siparis_id) AS siparis_sayisi
    FROM siparisler s
    LEFT JOIN bayiler b ON s.bayi_id = b.bayi_id
    GROUP BY b.sehir
    ORDER BY siparis_sayisi DESC
    LIMIT 4
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Şehir bazlı sipariş hatası:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// ✅ 3. AYLIK SATIŞ TRENDLERİ
router.get("/aylik-satis", (req, res) => {
  const sql = `
    SELECT
      aylar.ay,
      COALESCE(SUM(MONTH(s.tarih) = aylar.ay_no) * COUNT(s.siparis_id), 0) AS siparis_sayisi
    FROM (
      SELECT 1 AS ay_no, 'Oca' AS ay
      UNION ALL SELECT 2, 'Şub'
      UNION ALL SELECT 3, 'Mar'
      UNION ALL SELECT 4, 'Nis'
      UNION ALL SELECT 5, 'May'
      UNION ALL SELECT 6, 'Haz'
      UNION ALL SELECT 7, 'Tem'
      UNION ALL SELECT 8, 'Ağu'
      UNION ALL SELECT 9, 'Eyl'
      UNION ALL SELECT 10, 'Eki'
      UNION ALL SELECT 11, 'Kas'
      UNION ALL SELECT 12, 'Ara'
    ) AS aylar
    LEFT JOIN siparisler s ON MONTH(s.tarih) = aylar.ay_no
    GROUP BY aylar.ay_no, aylar.ay
    ORDER BY aylar.ay_no;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Aylık satış hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});


// ✅ 4. EN FAZLA SİPARİŞ ALAN 5 BAYİ (Top 5)
router.get("/top-bayiler", (req, res) => {
  const sql = `
    SELECT
      b.bayi_id,
      b.bayi_adi,
      b.sehir,
      COUNT(s.siparis_id) AS siparis_sayisi,
      SUM(s.toplam_tutar) AS toplam_satis
    FROM bayiler b
    LEFT JOIN siparisler s ON b.bayi_id = s.bayi_id
    GROUP BY b.bayi_id, b.bayi_adi, b.sehir
    ORDER BY siparis_sayisi DESC
    LIMIT 5
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Top bayiler hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});


// ✅ 5. SİPARİŞ DURUM DAĞILIMI (Pie Chart)
router.get("/siparis-durum", (req, res) => {
  const sql = `
    SELECT
      durum,
      COUNT(*) AS adet
    FROM siparisler
    GROUP BY durum
    ORDER BY adet DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Sipariş durum hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});


module.exports = router;


