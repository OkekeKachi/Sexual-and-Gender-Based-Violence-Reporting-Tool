const express = require("express");
const router = express.Router();
const { sendMessage, getCaseMessages, survivorMessage } = require("../controllers/messageController");
const { verifyMessageAccess, verifyToken, ensureAuthenticated } = require("../middlewares/auth");



// send message
router.post("/", ensureAuthenticated, verifyMessageAccess, sendMessage);

// get messages for a case
router.get("/:caseId",ensureAuthenticated, verifyMessageAccess, getCaseMessages);
router.post("/survivor", survivorMessage);

module.exports = router;