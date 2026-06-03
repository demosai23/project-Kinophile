import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'kinophile/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        ],
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, { path: result.secure_url, filename: result.public_id });
      }
    );
    file.stream.pipe(uploadStream);
  },
  _removeFile(req, file, cb) {
    cb(null);
  },
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

export default upload;