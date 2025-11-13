const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 🟣 Hammadde istatistikleri
router.get("/istatistikler", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS toplam,
      SUM(CASE WHEN stok_miktari / kritik_stok_seviyesi < 0.6 THEN 1 ELSE 0 END) AS kritik
    FROM hammadde
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ İstatistik sorgu hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }

    const row = results[0];
    res.json({
      toplam: row.toplam,
      kritik: row.kritik,
      ortalamaTuketim: 245, // geçici sabit değer
      tedarikIhtiyaci: row.kritik || 0
    });
  });
});


// 🟢 Tüm hammaddeleri getir
router.get("/", (req, res) => {
  db.query("SELECT * FROM hammadde", (err, results) => {
    if (err) {
      console.error("❌ Sorgu hatası:", err);
      res.status(500).json({ error: "Veritabanı hatası" });
    } else {
      res.json(results);
    }
  });
});

// 🟣 Yeni hammadde ekle
router.post("/", (req, res) => {
  const { hammadde_adi, birim, stok_miktari, kritik_stok_seviyesi } = req.body;

  if (!hammadde_adi || !birim || !stok_miktari || !kritik_stok_seviyesi) {
    return res.status(400).json({ error: "Tüm alanlar doldurulmalıdır." });
  }

  const sql = `
    INSERT INTO hammadde (hammadde_adi, birim, stok_miktari, kritik_stok_seviyesi)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [hammadde_adi, birim, stok_miktari, kritik_stok_seviyesi], (err, result) => {
    if (err) {
      console.error("❌ Veritabanı hatası:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.status(201).json({ message: "Yeni hammadde eklendi", id: result.insertId });
  });
});

// 🟡 Hammadde güncelle
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { hammadde_adi, birim, stok_miktari, kritik_stok_seviyesi } = req.body;

  const sql = `
    UPDATE hammadde
    SET hammadde_adi=?, birim=?, stok_miktari=?, kritik_stok_seviyesi=?
    WHERE hammadde_id=?
  `;
  db.query(sql, [hammadde_adi, birim, stok_miktari, kritik_stok_seviyesi, id], (err, result) => {
    if (err) {
      console.error("❌ Güncelleme hatası:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json({ message: "Hammadde güncellendi" });
  });
});

// 🔴 Hammadde sil
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM hammadde WHERE hammadde_id=?", [id], (err, result) => {
    if (err) {
      console.error("❌ Silme hatası:", err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json({ message: "Hammadde silindi" });
  });
});

module.exports = router;
