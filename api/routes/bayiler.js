const express = require('express');
const router = express.Router();
const db = require('../config/db'); // az önce oluşturduğumuz bağlantı

// Tüm bayileri getir (opsiyonel bayi_id filtresi ile)
router.get('/', (req, res) => {
  const { bayi_id } = req.query;

  let sql = 'SELECT * FROM bayiler';
  let params = [];

  if (bayi_id) {
    sql += ' WHERE bayi_id = ?';
    params.push(bayi_id);
  }

  db.query(sql, params, (err, results) => {
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

// Bayi güncelle
router.put('/:id', (req, res) => {
  const { bayi_adi, sehir, telefon_no, adres } = req.body;
  const id = req.params.id;

  const sql = "UPDATE bayiler SET bayi_adi = ?, sehir = ?, telefon_no = ?, adres = ? WHERE bayi_id = ?";
  db.query(sql, [bayi_adi, sehir, telefon_no, adres, id], (err, result) => {
    if (err) {
      console.error("❌ Bayi güncellenemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json({ message: "Bayi güncellendi" });
  });
});

// Bayi sil
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM bayiler WHERE bayi_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Bayi silinemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json({ message: "Bayi silindi" });
  });
});

module.exports = router;
