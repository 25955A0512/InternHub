const multer = require('multer');
const path = require('path');

// Where and how to store uploaded files
const storage = multer.diskStorage({

  // Save files to uploads/ folder
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  // Rename file to avoid duplicates
  // Example: resume-1710234567890.pdf
  filename: (req, file, cb) => {
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }

});

// Filter — only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);   // accept file
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

module.exports = upload;
