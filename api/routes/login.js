// routes/login.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 🔐 Gerçek login endpoint
router.post("/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli" });
  }

  const sql = `
    SELECT
      k.kullanici_id,
      k.kullanici_adi,
      k.sifre,
      k.rol,
      k.bayi_id,
      b.bayi_adi,
      b.sehir
    FROM kullanici k
    LEFT JOIN bayiler b ON k.bayi_id = b.bayi_id
    WHERE k.kullanici_adi = ?
  `;

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("❌ Login sorgu hatası:", err);
      return res.status(500).json({ error: "Veritabanı hatası" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
    }

    const kullanici = results[0];

    // Şifre kontrolü (plain text - güvenli değil ama mevcut sistemle uyumlu)
    if (kullanici.sifre !== password) {
      return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı" });
    }

    // Başarılı giriş
    console.log(`✅ Giriş başarılı: ${username} (${kullanici.rol})`);

    // Şifreyi döndürme
    delete kullanici.sifre;

    res.status(200).json({
      message: "Giriş başarılı!",
      kullanici
    });
  });
});

module.exports = router;
