const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sgbv_evidence",
    resource_type: "auto", // images, videos, docs
    allowed_formats: ["jpg", "png", "jpeg", "mp4", "pdf"]
  }
});

const upload = multer({ storage });

module.exports = upload;