import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../config/env.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 50);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ]);
    if (!allowed.has(file.mimetype)) return cb(new Error("Unsupported file type. Upload PDF, image, or video files only."));
    cb(null, true);
  },
});
