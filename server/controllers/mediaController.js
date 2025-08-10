// controllers/mediaController.js
const cloudinary = require("cloudinary").v2;
const multer = require("multer"); //File ko handle karne ke liye (in-memory).
const streamifier = require("streamifier"); //Buffer ko stream banane ke liye (kyunki cloudinary.upload_stream() stream leta hai).

// configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// In-memory upload with file size limit (5MB) || ek single file lega in-memory mein , image type ki
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single("image");

// ✅ Acceptable MIME types
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

// POST /upload/image  //Ye Express middleware array hai. Pehle upload, fir async handler.
exports.uploadImage = [
  upload,
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Please select an image file" });

      // ✅ MIME type validation
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, message: "Only JPG, PNG, and WEBP formats are allowed" });
      }

      // ✅ Upload to Cloudinary via stream
      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              format: "webp",
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          // ✅ Convert Buffer to Readable Stream & pipe to Cloudinary
          streamifier.createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload(req.file.buffer);

      res.json({ success: true, url: result.secure_url, public_id: result.public_id });
    } catch (err) {
      console.error("uploadImage error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  },
];

// ✅ Buffer to Stream Upload Explanation:

/*
  🧠 req.file.buffer:
      - Ye multer ne diya hai.
      - Isme image ka raw binary data hota hai memory mein (in-memory Buffer).
  
  📦 Lekin Cloudinary ka upload_stream() ek "Readable Stream" expect karta hai,
      na ki directly Buffer.

  🔄 Isiliye:
      streamifier.createReadStream(buffer):
      - Buffer ko ek Readable Stream mein convert karta hai.
  
      .pipe(stream):
      - Yeh stream ko Cloudinary ke upload stream mein bhejta hai.
      - Taki bina kisi temp file ke directly memory se Cloudinary par image upload ho jaye.
  
  ✅ Is approach ka fayda:
      - Fast
      - No disk usage (fully in-memory)
      - Scalable for APIs (e.g., profile pic, product image, etc.)
*/
