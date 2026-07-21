const express = require("express");
const router = express.Router();

const {
  getAllReports,
  getReportById,
  updateReportStatus,
  getDashboardStats,
  updateReport,
  deleteReport,
  addAction,
  runEscalationCheck,
  createWorker,
  createDepartment,
  getDepartments,
  completePasswordSetup
} = require("../controllers/adminController");

const {ensureAuthenticated, ensureAdmin } = require("../middlewares/auth");
const admin = require("../models/utils/firebaseAdmin");
const {verifyToken} = require("../middlewares/auth");
const { route } = require("./uploadRoute");


//create admin route
router.post("/make-admin", async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().setCustomUserClaims(uid, {
      role: "admin"
    });

    res.json({ success: true, message: "User is now admin" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin dashboard
router.get("/reports", verifyToken,ensureAdmin, getAllReports);

// Single report view
router.get("/dashboard",ensureAuthenticated, ensureAdmin, getDashboardStats);
router.get("/reports/:id", ensureAuthenticated, getReportById);


// Update status
router.patch("/reports/:id/status", ensureAdmin, updateReportStatus);
router.patch("/reports/:id/action", ensureAdmin, addAction);

router.patch("/reports/:id", ensureAdmin, updateReport);
router.delete("/reports/:id", ensureAdmin, deleteReport);
router.post(
  "/create-worker",
  ensureAdmin,
  createWorker
);

router.post(
  "/create-department",
  ensureAdmin,
  createDepartment
);
router.get(
  "/departments",
  ensureAdmin,
  getDepartments
);
router.patch(
  "/complete-password-setup",
  ensureAuthenticated,
  completePasswordSetup
);



// router.post("/runEscalation", ensureAdmin, runEscalationCheck);


module.exports = router;