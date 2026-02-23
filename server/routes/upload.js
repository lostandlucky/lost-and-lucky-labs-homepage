import multer from 'multer';
import { join } from 'path';

export function createUploadMiddleware(imagesDir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const projectSlug = req.projectSlug;
      const dest = join(imagesDir, 'projects', projectSlug);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      const name = `${Date.now()}.${ext}`;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, and WebP files are allowed'));
      }
    },
  });
}
