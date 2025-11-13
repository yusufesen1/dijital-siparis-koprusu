const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 📌 SİPARİŞ GETİRME (Filtre destekli)
router.get("/", (req, res) => {
  const durum = req.query.durum; // ?durum=Onay Bekliyor

  let sql = `
    SELECT s.*, b.bayi_adi
    FROM siparisler s
    LEFT JOIN bayiler b ON s.bayi_id = b.bayi_id
  `;

  const params = [];

  if (durum && durum !== "Tümü") {
    sql += " WHERE s.durum = ?";
    params.push(durum);
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

// 📌 Yeni sipariş ekleme (istersen ileride kullanacağız)
router.post("/", (req, res) => {
  const { bayi_id, durum, toplam_tutar } = req.body;
  const tarih = new Date();

  const sql = `
    INSERT INTO siparisler (bayi_id, durum, toplam_tutar, tarih)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [bayi_id, durum, toplam_tutar, tarih], (err, result) => {
    if (err) {
      console.error("❌ Eklenemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.status(201).json({ message: "Sipariş eklendi", id: result.insertId });
  });
});

// 📌 Son 7 Günlük Sipariş Trendi
router.get("/7gunluk", (req, res) => {
  const sql = `
    SELECT DATE(tarih) AS gun, COUNT(*) as adet
    FROM siparisler
    WHERE tarih >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(tarih)
    ORDER BY gun ASC;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası" });
    res.json(results);
  });
});

// 📌 Sipariş Durum Dağılımı
router.get("/durumlar", (req, res) => {
  const sql = `
    SELECT durum, COUNT(*) AS adet
    FROM siparisler
    GROUP BY durum;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Veritabanı hatası" });
    res.json(results);
  });
});


module.exports = router;

