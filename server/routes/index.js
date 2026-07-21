var express = require('express');
var router = express.Router();
const app = express();
const session = require('express-session');
const { apps, auth, db } = require('../models/firebase');
const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, setDoc, getDocs, doc, query, where } = require('firebase/firestore');

const { ensureAuthenticated } = require('../middlewares/auth');
const { submitReport } = require('../controllers/reportController');
const { getUserReports } = require('../controllers/reportController');
const { signup, login } = require('../controllers/authController');

/* GET home page. */
router.get('/', function (req, res, next) {
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // Clear after displaying
  res.render('index', { successMessage, user: req.session.user });

});



router.get('/resources', (req, res, next) => {
  res.render('resource', { error: "", user: req.session.user });
});

router.get('/report', ensureAuthenticated, (req, res, next) => {
  res.render('report', { error: "" });
});
router.get('/login', (req, res, next) => {
  const successMessage = req.session.successMessage;
  req.session.successMessage = null; // Clear after displaying
  res.render('login', { error: "", successMessage });
});

router.get('/register', (req, res, next) => {
  res.render('register', { error: "" });
});







module.exports = router;
