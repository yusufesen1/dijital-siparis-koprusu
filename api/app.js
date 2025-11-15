// api/app.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Router dosyaları
const loginRouter = require("./routes/login");
const siparislerRouter = require("./routes/siparisler");
const bayilerRouter = require("./routes/bayiler");
const hammaddeRouter = require("./routes/hammadde");
const uretimRouter = require("./routes/uretim");
const fabrikaDashboardRouter = require("./routes/fabrikaDashboard");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statik frontend (index.html vs)
app.use(express.static(path.join(__dirname, "../dijital-siparis-paneli")));

// Rotalar
app.use("/login", loginRouter);
app.use("/siparisler", siparislerRouter);
app.use("/bayiler", bayilerRouter);
app.use("/hammadde", hammaddeRouter);
app.use("/uretim", uretimRouter);
app.use("/fabrika", fabrikaDashboardRouter);

// Varsayılan route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

module.exports = app;


