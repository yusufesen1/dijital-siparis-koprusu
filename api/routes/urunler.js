const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /urunler - Tüm ürünleri listele
router.get("/", (req, res) => {
  const sql = `
    SELECT
      urun_id,
      urun_kodu,
      urun_adi,
      urun_tip,
      birim,
      fiyat,
      mevcut_stok
    FROM urunler
    ORDER BY urun_adi ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Ürünler alınamadı:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.json(results);
  });
});

// POST /urunler - Yeni ürün ekle
router.post("/", (req, res) => {
  const { urun_kodu, urun_adi, urun_tip, birim, fiyat, mevcut_stok } = req.body;

  if (!urun_kodu || !urun_adi || !urun_tip || !birim || fiyat === undefined || mevcut_stok === undefined) {
    return res.status(400).json({ error: "Tüm alanlar gereklidir" });
  }

  const sql = `
    INSERT INTO urunler (urun_kodu, urun_adi, urun_tip, birim, fiyat, mevcut_stok)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [urun_kodu, urun_adi, urun_tip, birim, fiyat, mevcut_stok], (err, result) => {
    if (err) {
      console.error("❌ Ürün eklenemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    res.status(201).json({
      message: "Ürün başarıyla eklendi",
      urun_id: result.insertId
    });
  });
});

// DELETE /urunler/:id - Ürün sil
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM urunler WHERE urun_id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Ürün silinemedi:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }
    res.json({ message: "Ürün başarıyla silindi" });
  });
});

module.exports = router;
