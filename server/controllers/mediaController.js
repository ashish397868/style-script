// controllers/mediaController.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

// configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// in-memory storage
const upload = multer().single("image");

// POST /upload/image
exports.uploadImage = [
  upload,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file" });

      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload(req.file.buffer);
      res.json({ url: result.secure_url, public_id: result.public_id });
    } catch (err) {
      console.error("uploadImage error:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  },
]; 