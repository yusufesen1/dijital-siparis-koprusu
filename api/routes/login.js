// routes/login.js
const express = require("express");
const router = express.Router();

// 🎯 Basitleştirilmiş login endpoint (herkese izin verir)
router.post("/", (req, res) => {
  const { username, password, type } = req.body;

  // Hata kontrolü kaldırıldı, her kullanıcı giriş yapabilir
  console.log(`🔹 Demo giriş: ${username} (${type})`);

  const kullanici = {
    kullanici_id: 1,
    kullanici_adi: username || "demo_kullanici",
    bayi_id: type === "dealer" ? 1 : null,
    rol: type === "dealer" ? "bayi" : "fabrika"
  };

  res.status(200).json({
    message: "Giriş başarılı (demo modu)!",
    kullanici
  });
});

module.exports = router;
