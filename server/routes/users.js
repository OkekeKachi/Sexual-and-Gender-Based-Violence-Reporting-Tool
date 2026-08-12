const express = require("express");
const router = express.Router();

const { signup, login, resendVerification, verificationStatus } = require("../controllers/authController");

// AUTH ROUTES
router.post("/signup", signup);
router.post("/login", login);
router.post("/resend-verification", resendVerification);
router.get("/verification-status", verificationStatus);
module.exports = router;