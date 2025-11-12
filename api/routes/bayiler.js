const express = require('express');
const router = express.Router();
const db = require('../config/db'); // az önce oluşturduğumuz bağlantı

// Tüm bayileri getir
router.get('/', (req, res) => {
  db.query('SELECT * FROM bayiler', (err, results) => {
    if (err) {
      console.error('Sorgu hatası:', err);
      res.status(500).json({ error: 'Veritabanı hatası' });
    } else {
      res.json(results); // Bayi listesini JSON olarak gönder
    }
  });
});

router.post('/', (req, res) => {
  const { bayi_adi, sehir, telefon_no } = req.body;
  console.log("📩 Gelen veri:", req.body);

  const sql = "INSERT INTO bayiler (bayi_adi, sehir, telefon_no) VALUES (?, ?, ?)";
  db.query(sql, [bayi_adi, sehir, telefon_no], (err, result) => {
    if (err) {
      console.error("❌ Veritabanı hatası:", err.sqlMessage || err);
      return res.status(500).json({ error: err.sqlMessage || err });
    }
    console.log("✅ Yeni bayi eklendi:", result);
    res.status(201).json({ message: "Yeni bayi eklendi!", id: result.insertId });
  });
});



module.exports = router;
