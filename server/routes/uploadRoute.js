const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { uploadEvidence } = require("../controllers/uploadController");
const { deleteUploads } = require("../controllers/uploadController");
// upload multiple files
router.post("/evidence", upload.array("files", 5), uploadEvidence);
router.delete("/evidence", deleteUploads);

module.exports = router;