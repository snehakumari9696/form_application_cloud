const express = require("express");
const crypto = require("crypto");
const path = require("path");
const pool = require("../config/db");
const s3 = require("../config/s3");
const upload = require("../middleware/upload");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

router.post("/", upload.single("file"), async (req, res, next) => {
  let uploadedKey;

  try {
    const name = String(req.body.name || "").trim();
    const age = Number(req.body.age);
    const file = req.file;

    if (!name || name.length > 100) {
      return res.status(400).json({ message: "Name is required and must be 100 characters or fewer." });
    }
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return res.status(400).json({ message: "Age must be a whole number between 1 and 120." });
    }
    if (!file) {
      return res.status(400).json({ message: "Please select a file to upload." });
    }
    if (!process.env.S3_BUCKET_NAME) {
      return res.status(500).json({ message: "S3 bucket is not configured on the server." });
    }

    const safeExtension = path.extname(file.originalname).toLowerCase();
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}${safeExtension}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Bucket remains private; do not set public-read ACL.
      ServerSideEncryption: "AES256",
    }));
    uploadedKey = key;

    const [result] = await pool.execute(
      `INSERT INTO submissions (name, age, s3_bucket, s3_key, original_filename, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, age, process.env.S3_BUCKET_NAME, key, file.originalname, file.mimetype, file.size]
    );

    return res.status(201).json({
      message: "Form submitted and file uploaded successfully.",
      submission: {
        id: result.insertId,
        name,
        age,
        s3Key: key,
        originalFilename: file.originalname,
      },
    });
  } catch (error) {
    // If the DB insert fails after the S3 upload, the object may remain in S3.
    // A production app should implement cleanup/retry handling for this case.
    next(error);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, age, s3_key AS s3Key, original_filename AS originalFilename,
              mime_type AS mimeType, file_size AS fileSize, created_at AS createdAt
       FROM submissions ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ submissions: rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
