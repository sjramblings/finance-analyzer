import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { UploadService } from '../services/UploadService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { config } from '../config.js';

const router = Router();
const uploadService = new UploadService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: config.upload.dir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSize },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

// POST /api/upload
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = await uploadService.processCSV(req.file.originalname, req.file.path);
    res.json({ jobId });
  })
);

// GET /api/upload/:jobId/status
router.get(
  '/:jobId/status',
  asyncHandler(async (req, res) => {
    const job = await uploadService.getJobStatus(req.params.jobId);
    res.json(job);
  })
);

// POST /api/upload/:jobId/confirm
router.post(
  '/:jobId/confirm',
  asyncHandler(async (req, res) => {
    const { corrections } = req.body;
    const result = await uploadService.confirmUpload(req.params.jobId, corrections);
    res.json(result);
  })
);

export default router;
