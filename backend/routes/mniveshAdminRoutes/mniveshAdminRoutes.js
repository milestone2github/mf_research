// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');
<<<<<<< HEAD
const FixedDipositsRoute = require('../../controllers/mniveshAdminControllers/AdminFixedDipositsController');
const IposRoute = require('../../controllers/mniveshAdminControllers/AdminIposControllers');
=======
const FdsRoute = require('../../controllers/mniveshAdminControllers/AdminFdController');
const uploadImageMiddleware  = require('../../middlewares/uploadImage')
>>>>>>> f4b1cabff01acc64c21f4ef4c7ff877c0ac1d766

// Blogs Routes
router.post("/blogs", uploadImageMiddleware, BlogRoute.createNewBlog);
router.put("/blogs/:slug", BlogRoute.updateBlog);
router.delete("/blogs/:slug", BlogRoute.deleteBlog);
router.get("/blogs", BlogRoute.getBlogsSearch);
router.get("/blogs/:slug", BlogRoute.getBlog);

// Fixed-Diposits Routes
router.put("/fixed-deposits/:slug", FixedDipositsRoute.updateFixedDiposits);
router.get("/fixed-diposits", FixedDipositsRoute.getAllFixedDiposits);
router.get("/fixed-diposits/:slug", FixedDipositsRoute.getFixedDepositsBySlug);

// Ipos Route
router.get("/ipos", IposRoute.getIpos);
router.get("/ipos/:slug", IposRoute.getIposBySlug);
router.post("/ipos", IposRoute.createIpos);
router.delete("/ipos/:slug", IposRoute.deleteIpos);

module.exports = router;