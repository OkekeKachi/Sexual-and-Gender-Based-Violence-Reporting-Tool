const express = require("express");
const router = express.Router();
const { ensureAuthenticated, requireRole } = require("../middlewares/auth");
const { getDepartmentQueue, claimReport, getMyCases,getMe } = require("../controllers/caseworkerController");
// const { workerSendMessage } = require("../controllers/messageController");


router.get(
  "/queue",
  ensureAuthenticated,
  // requireRole("caseworker"),
  getDepartmentQueue
);

router.post(
  "/claim",
  ensureAuthenticated,
  requireRole("caseworker"),
  claimReport
);

router.get(
  "/my-cases",
  ensureAuthenticated,
  requireRole("caseworker"),
  getMyCases
);
// router.post(
//   "/reply",
//   ensureAuthenticated,
//   requireRole("caseworker"),
//   workerSendMessage
// );
router.get(
  "/me",
  ensureAuthenticated,
  getMe
);
module.exports = router;