exports.uploadEvidence = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded"
      });
    }

    const uploadedFiles = req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      type: file.mimetype,
      uploadedAt: new Date().toISOString()
    }));

    return res.status(200).json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error("Upload failed:", error);

    return res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
};

exports.deleteUploads = async (req, res) => {
  const { public_ids } = req.body;

  try {
    await Promise.all(
      public_ids.map(id => cloudinary.uploader.destroy(id))
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};