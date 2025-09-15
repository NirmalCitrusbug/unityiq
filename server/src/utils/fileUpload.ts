import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import express from 'express';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'));
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for handling single file upload
export const uploadSingleImage = (fieldName: string) => {
  return upload.single(fieldName);
};

// Process the uploaded file to get buffer and content type
export const processUploadedFile = (file?: Express.Multer.File) => {
  if (!file) return undefined;
  
  return {
    data: file.buffer,
    contentType: file.mimetype
  };
};

// Serve static files
export const serveStaticFiles = (app: express.Application) => {
  app.use('/uploads', (req, res, next) => {
    // Set cache control headers (1 day)
    res.setHeader('Cache-Control', 'public, max-age=86400');
    next();
  }, express.static('uploads'));
};
