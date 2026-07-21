require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const cors = require("cors");
const cron = require("node-cron");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reportRouter = require('./routes/report');
var adminRouter = require('./routes/admin');
var uploadRouter = require("./routes/uploadRoute");
var locationRouter = require("./routes/locationRoute");
var caseworkerRouter = require("./routes/caseworkerRoute");
var messageRouter = require("./routes/messageRoutes")
const { runEscalationCheck } = require("./controllers/adminController");
const { autoAssignEscalatedCases } = require("./controllers/adminController");

var app = express();
app.use(express.json());

// Session config
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
};

cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("⏳ Running escalation + auto assign job...");

    await runEscalationCheck();
    await autoAssignEscalatedCases();

    console.log("✅ Cron job completed");
  } catch (error) {
    console.error("❌ Cron job failed:", error);
  }
});


app.use(session(sessionOptions));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/location', locationRouter);
app.use('/api/worker', caseworkerRouter);
app.use('/api/messages', messageRouter);  

// 404 handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;