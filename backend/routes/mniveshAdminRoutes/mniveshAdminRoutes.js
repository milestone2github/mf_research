// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');
const FixedDipositsRoute = require('../../controllers/mniveshAdminControllers/AdminFixedDipositsController');
const IposRoute = require('../../controllers/mniveshAdminControllers/AdminIposControllers');
const uploadImageMiddleware  = require('../../middlewares/uploadImage')

// Blogs Routes
router.post("/blogs", uploadImageMiddleware.uploadImageBlogs, BlogRoute.createNewBlog);
router.put("/blogs/:slug", uploadImageMiddleware.uploadImageBlogsUpdate, BlogRoute.updateBlog);
router.delete("/blogs/:slug", BlogRoute.deleteBlog);
router.get("/blogs", BlogRoute.getBlogsSearch);
router.get("/blogs/:slug", BlogRoute.getBlog);

// Fixed-Diposits Routes
router.post("/fixed-deposits", uploadImageMiddleware.uploadImageFixedDiposits, FixedDipositsRoute.createNewFixedDiposits);
router.delete("/fixed-deposits/:slug", FixedDipositsRoute.deleteFixedDiposits);
router.put("/fixed-deposits/:slug", uploadImageMiddleware.uploadImageFixedDipositsUpdate, FixedDipositsRoute.updateFixedDiposits);
router.get("/fixed-diposits", FixedDipositsRoute.getAllFixedDiposits);
router.get("/fixed-diposits/:slug", FixedDipositsRoute.getFixedDepositsBySlug);

// Ipos Route
router.put("/ipos/:slug", IposRoute.updateIpos);
router.get("/ipos", IposRoute.getIpos);
router.get("/ipos/:slug", IposRoute.getIposBySlug);
router.post("/ipos", IposRoute.createIpos);
router.delete("/ipos/:slug", IposRoute.deleteIpos);

module.exports = router;