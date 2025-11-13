if (process.env.NODE_ENV != "production")
  require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 📌 app burada oluşturulmalı
var app = express();

const cors = require('cors');
app.use(cors());

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var bayilerRouter = require('./routes/bayiler');
var hammaddeRouter = require('./routes/hammadde');
var siparislerRouter = require("./routes/siparisler");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 📌 router bağlantıları app tanımından sonra yapılmalı
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/bayiler', bayilerRouter);
app.use('/hammadde', hammaddeRouter);
app.use("/siparisler", siparislerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

