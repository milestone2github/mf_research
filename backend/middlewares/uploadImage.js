const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, '../images/blog');
//         if (!fs.existsSync(uploadPath)) {
//             fs.mkdirSync(uploadPath, { recursive: true });
//           }
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = `${Date.now()}-${file.originalname}`;
//         cb(null, uniqueName);
//     }
// });
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageBlogs = [
    upload.single('image'),
    async (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        try {
            const formData = new FormData();
            formData.append('image', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const uploadRes = await axios.post(
                'https://niveshonline.com/api/blogs/upload-image',
                formData,
                { headers: formData.getHeaders() }
            );

            if (uploadRes.data?.path) {
                const fileName = uploadRes.data.path.split('/').pop();
                req.imageName = fileName;
                req.imageUploadMessage = uploadRes.data.success;
            } else {
                return res.status(500).json({ success: false, message: 'Failed to upload image' });
            }

            next();

        } catch (error) {
            console.error('Image Upload Error:', error?.response?.data || error.message);
            return res.status(500).json({
              success: false,
              message: 'Image upload failed',
              error: error?.response?.data || error.message
            });
        }
    },
];

const uploadImageFixedDiposits = [
    upload.single('logo'),
    async (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Logo file is required' });
        }

        try {
            const formData = new FormData();
            formData.append('image', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const uploadRes = await axios.post(
                'https://niveshonline.com/api/fixed-deposits/upload-image',
                formData,
                { headers: formData.getHeaders() }
            );

            if (uploadRes.data?.path) {
                const fileName = uploadRes.data.path.split('/').pop();
                req.logo = fileName;
                req.imageUploadMessage = uploadRes.data.success;
            } else {
                return res.status(500).json({ success: false, message: 'Failed to upload image' });
            }

            next();
        } catch (error) {
            console.error('Image Upload Error:', error?.response?.data || error.message);
            return res.status(500).json({
                success: false,
                message: 'Image upload failed',
                error: error?.response?.data || error.message,
            });
        }
    },
];

const uploadImageBlogsUpdate = [
    upload.single('image'),
    async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            const formData = new FormData();
            formData.append('image', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const uploadRes = await axios.post(
                'https://niveshonline.com/api/blogs/upload-image',
                formData,
                { headers: formData.getHeaders() }
            );

            if (uploadRes.data?.path) {
                const fileName = uploadRes.data.path.split('/').pop();
                req.imageName = fileName;
                req.imageUploadMessage = uploadRes.data.success;
            } else {
                return res.status(500).json({ success: false, message: 'Failed to upload image' });
            }

            next();
        } catch (error) {
            console.error('Image Upload Error:', error?.response?.data || error.message);
            return res.status(500).json({
                success: false,
                message: 'Image upload failed',
                error: error?.response?.data || error.message,
            });
        }
    },
];

const uploadImageFixedDipositsUpdate = [
    upload.single('logo'),
    async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            const formData = new FormData();
            formData.append('image', req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });

            const uploadRes = await axios.post(
                'https://niveshonline.com/api/fixed-deposits/upload-image',
                formData,
                { headers: formData.getHeaders() }
            );

            if (uploadRes.data?.path) {
                const fileName = uploadRes.data.path.split('/').pop();
                req.logo = fileName;
                req.imageUploadMessage = uploadRes.data.success;
            } else {
                return res.status(500).json({ success: false, message: 'Failed to upload image' });
            }

            next();
        } catch (error) {
            console.error('Image Upload Error:', error?.response?.data || error.message);
            return res.status(500).json({
                success: false,
                message: 'Image upload failed',
                error: error?.response?.data || error.message,
            });
        }
    },
];

// const uploadImageBlogs = [
//     upload.single('image'),
//     async (req, res, next) => {
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'Image file is required' });
//         }

//         try {
//             const formData = new FormData();
//             formData.append('image', fs.createReadStream(req.file.path));

//             const uploadRes = await axios.post('https://niveshonline.com/api/blogs/upload-image', formData, {
//                 headers: formData.getHeaders(),
//             });

//             if (uploadRes.data?.path) {
//                 const fileName = path.basename(uploadRes.data.path);

//                 req.imageName = fileName;
//                 req.imageUploadMessage = uploadRes.data.success; // storing message for controller

//             } else {
//                 return res.status(500).json({ success: false, message: 'Failed to upload image' });
//             }

//             fs.unlinkSync(req.file.path); // Cleaning temp file
//             next();

//         } catch (error) {
//             console.error('Image Upload Error:', error?.response?.data || error.message);
//             return res.status(500).json({
//               success: false,
//               message: 'Image upload failed',
//               error: error?.response?.data || error.message
//             });
//           }          
//     }
// ];

// const uploadImageFixedDiposits = [
//     upload.single('logo'),
//     async (req, res, next) => {
//         if (!req.file) {
//             return res.status(400).json({ success: false, message: 'Logo file is required' });
//         }

//         try {
//             const formData = new FormData();
//             formData.append('image', fs.createReadStream(req.file.path));

//             const uploadRes = await axios.post('https://niveshonline.com/api/fixed-deposits/upload-image', formData, {
//                 headers: formData.getHeaders(),
//             });

//             if (uploadRes.data?.path) {
//                 const fileName = path.basename(uploadRes.data.path);

//                 req.logo = fileName;
//                 req.imageUploadMessage = uploadRes.data.success; // storing message for controller

//             } else {
//                 return res.status(500).json({ success: false, message: 'Failed to upload image' });
//             }

//             fs.unlinkSync(req.file.path); // Cleaning temp file
//             next();

//         } catch (error) {
//             console.error('Image Upload Error:', error?.response?.data || error.message);
//             return res.status(500).json({
//               success: false,
//               message: 'Image upload failed',
//               error: error?.response?.data || error.message
//             });
//           }          
//     }
// ];
// const uploadImageBlogsUpdate = [
//     upload.single('image'),
//     async (req, res, next) => {
//         if (!req.file) {
//             return next();
//         }

//         try {
//             const formData = new FormData();
//             formData.append('image', fs.createReadStream(req.file.path));

//             const uploadRes = await axios.post('https://niveshonline.com/api/blogs/upload-image', formData, {
//                 headers: formData.getHeaders(),
//             });

//             if (uploadRes.data?.path) {
//                 const fileName = path.basename(uploadRes.data.path);

//                 req.imageName = fileName;
//                 req.imageUploadMessage = uploadRes.data.success; // storing message for controller

//             } else {
//                 return res.status(500).json({ success: false, message: 'Failed to upload image' });
//             }

//             fs.unlinkSync(req.file.path); // Cleaning temp file
//             next();

//         } catch (error) {
//             console.error('Image Upload Error:', error?.response?.data || error.message);
//             return res.status(500).json({
//               success: false,
//               message: 'Image upload failed',
//               error: error?.response?.data || error.message
//             });
//           }          
//     }
// ];

// const uploadImageFixedDipositsUpdate = [
//     upload.single('logo'),
//     async (req, res, next) => {
//         if (!req.file) {
//             return next();
//         }

//         try {
//             const formData = new FormData();
//             formData.append('image', fs.createReadStream(req.file.path));

//             const uploadRes = await axios.post('https://niveshonline.com/api/fixed-deposits/upload-image', formData, {
//                 headers: formData.getHeaders(),
//             });

//             if (uploadRes.data?.path) {
//                 const fileName = path.basename(uploadRes.data.path);

//                 req.logo = fileName;
//                 req.imageUploadMessage = uploadRes.data.success; // storing message for controller

//             } else {
//                 return res.status(500).json({ success: false, message: 'Failed to upload image' });
//             }

//             fs.unlinkSync(req.file.path); // Cleaning temp file
//             next();

//         } catch (error) {
//             console.error('Image Upload Error:', error?.response?.data || error.message);
//             return res.status(500).json({
//               success: false,
//               message: 'Image upload failed',
//               error: error?.response?.data || error.message
//             });
//           }          
//     }
// ];
module.exports = { uploadImageBlogs, uploadImageFixedDiposits, uploadImageBlogsUpdate, uploadImageFixedDipositsUpdate };
