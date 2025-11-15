const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 📦 Bayi ana sayfa verileri
router.get("/:bayiId", (req, res) => {
  const bayiId = req.params.bayiId;

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM siparisler WHERE bayi_id = ? AND tarih >= DATE_SUB(NOW(), INTERVAL 1 MONTH)) AS toplam_siparis,
      (SELECT COUNT(*) FROM siparisler WHERE bayi_id = ? AND durum = 'Onay Bekliyor') AS bekleyen_siparis,
      (SELECT COUNT(*) FROM siparisler WHERE bayi_id = ? AND durum = 'Tamamlandı') AS teslim_edilen
  `;

  const sqlSonSiparisler = `
    SELECT siparis_id, tarih, durum, toplam_tutar 
    FROM siparisler 
    WHERE bayi_id = ? 
    ORDER BY tarih DESC 
    LIMIT 3
  `;

  db.query(sql, [bayiId, bayiId, bayiId], (err, summaryResults) => {
    if (err) {
      console.error("❌ Özet sorgusu hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }

    db.query(sqlSonSiparisler, [bayiId], (err2, recentResults) => {
      if (err2) {
        console.error("❌ Son sipariş sorgusu hatası:", err2);
        return res.status(500).json({ error: "Veritabanı hatası" });
      }

      res.json({
        toplam: summaryResults[0].toplam_siparis,
        bekleyen: summaryResults[0].bekleyen_siparis,
        teslim_edilen: summaryResults[0].teslim_edilen,
        son_siparisler: recentResults
      });
    });
  });
});

module.exports = router;
