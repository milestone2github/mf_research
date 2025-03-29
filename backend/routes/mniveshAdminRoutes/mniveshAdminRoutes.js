// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');
const FdsRoute = require('../../controllers/mniveshAdminControllers/AdminFdController');
const uploadImageMiddleware  = require('../../middlewares/uploadImage')

// Blogs Routes
router.post("/blogs", uploadImageMiddleware, BlogRoute.createNewBlog);
router.put("/blogs/:slug", BlogRoute.updateBlog);
router.delete("/blogs/:slug", BlogRoute.deleteBlog);
router.get("/blogs", BlogRoute.getBlogsSearch);
router.get("/blogs/:slug", BlogRoute.getBlog);

// Fds Routes
router.post("/fds/update", FdsRoute.UpdateFds);
router.post("/fds", FdsRoute.GetFdsSearch);


module.exports = router;