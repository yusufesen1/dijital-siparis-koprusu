const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ 1. Üretimdeki siparişleri getir
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      s.siparis_id,
      b.bayi_adi,
      GROUP_CONCAT(u.urun_adi SEPARATOR ', ') AS urun_adi,
      SUM(sd.miktar) AS miktar,
      s.tarih AS baslangic_tarihi,
      DATE_ADD(s.tarih, INTERVAL 7 DAY) AS bitis_tarihi
    FROM siparisler s
    LEFT JOIN bayiler b ON s.bayi_id = b.bayi_id
    LEFT JOIN siparis_detay sd ON sd.siparis_id = s.siparis_id
    LEFT JOIN urunler u ON u.urun_id = sd.urun_id
    WHERE s.durum = 'Üretimde'
    GROUP BY s.siparis_id
    ORDER BY s.siparis_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL Hatası:", err);
      return res.status(500).json({ error: "SQL hatası" });
    }
    res.json(results);
  });
});

// ✅ 2. Üretimi tamamla
router.post("/:id/tamamla", (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE siparisler SET durum = 'Tamamlandı' WHERE siparis_id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Sipariş durumu güncellenemedi:", err);
      return res.status(500).json({ error: "Sipariş durumu güncellenemedi" });
    }

    res.json({ message: "✅ Üretim tamamlandı olarak işaretlendi." });
  });
});

// ✅ 3. Üretimi beklemeye al
router.post("/:id/beklet", (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE siparisler SET durum = 'Onay Bekliyor' WHERE siparis_id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ Sipariş durumu güncellenemedi:", err);
      return res.status(500).json({ error: "Sipariş durumu güncellenemedi" });
    }

    res.json({ message: "⏳ Sipariş beklemeye alındı." });
  });
});

module.exports = router;

