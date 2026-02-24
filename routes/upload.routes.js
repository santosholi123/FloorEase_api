const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  try {
    console.log("UPLOAD HIT");
    console.log("UPLOAD CONTENT-TYPE:", req.headers["content-type"]);
    console.log("UPLOAD REQ.BODY KEYS:", Object.keys(req.body || {}));
    console.log("UPLOAD REQ.FILE:", req.file || null);
    console.log("UPLOAD REQ.FILES:", req.files || null);

    const userIdForUpdate = req.user?.id || req.body?.userId || null;
    console.log("UPLOAD USER ID FOR UPDATE:", userIdForUpdate);

    if (req.file) {
      console.log("UPLOAD FILE originalname:", req.file.originalname);
      console.log("UPLOAD FILE mimetype:", req.file.mimetype);
      console.log("UPLOAD FILE size:", req.file.size);
      console.log("UPLOAD FILE filename:", req.file.filename);
      console.log("UPLOAD FILE path:", req.file.path);
    }

    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Uploaded",
      imageUrl,
    });
  } catch (error) {
    console.error("UPLOAD ROUTE ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
 //