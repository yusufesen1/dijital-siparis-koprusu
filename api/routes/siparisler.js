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

// POST /siparisler  (ileride ihtiyaç olursa)
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

module.exports = router;


