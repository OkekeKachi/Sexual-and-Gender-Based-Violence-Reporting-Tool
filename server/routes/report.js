const express = require("express");
const router = express.Router();

const { trackReport, getUserReports, createReport, resolveReport } = require("../controllers/reportController");
const { ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");

// REPORT ROUTES
// router.post("/submit-report", ensureAuthenticated, submitReport);
router.get("/view-reports", ensureAuthenticated, ensureAdmin, getUserReports);
router.post("/create-report", createReport);
router.post("/track", trackReport);
router.post("/resolve",ensureAuthenticated, resolveReport);

module.exports = router;