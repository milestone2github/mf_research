const multer = require('multer');

const allowedDocTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const allowedImageTypes = ['image/jpeg', 'image/png'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [...allowedDocTypes, ...allowedImageTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG files are allowed'), false);
  }
};

const uploadOnboardingDocs = multer({ storage, fileFilter }).fields([
  { name: 'tenthMarksheetFile', maxCount: 1 },
  { name: 'lastEducationFileUpload', maxCount: 1 },
  { name: 'latestUpdateCvUpload', maxCount: 1 },
  { name: 'personalDetails.photo', maxCount: 1 },
  { name: 'bankDetails.bankVerificationDoc', maxCount: 1 },
]);

module.exports = { uploadOnboardingDocs };
