import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_DIR } from '../services/pdfService.js';

// Allowed MIME types and extensions
const ALLOWED_MIME = ['application/pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate safe, unique, cryptographically random filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const safeExt = '.pdf';
    cb(null, `paper-${Date.now()}-${uniqueSuffix}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new Error('Only PDF documents (.pdf) are permitted.'), false);
  }

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error('Invalid MIME type. Only application/pdf is accepted.'), false);
  }

  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});
