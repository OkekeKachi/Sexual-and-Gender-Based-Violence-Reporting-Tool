const express = require("express");
const router = express.Router();

const { trackReport, getUserReports, createReport, resolveReport } = require("../controllers/reportController");
const { ensureAuthenticated, ensureAdmin, optionalAuth } = require("../middlewares/auth");

// REPORT ROUTES
// router.post("/submit-report", ensureAuthenticated, submitReport);
router.get("/view-reports", ensureAuthenticated,  getUserReports);
router.post("/create-report", ensureAuthenticated, createReport);
router.post("/track", trackReport);
router.post("/resolve",ensureAuthenticated, resolveReport);

module.exports = router;