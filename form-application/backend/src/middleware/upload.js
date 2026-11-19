const multer = require("multer");

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".txt"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const path = require("path");
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      return cb(null, true);
    }
    cb(new Error("Unsupported file type. Upload PDF, JPG, PNG, WEBP, or TXT."));
  },
});

module.exports = upload;
