// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');
const FdsRoute = require('../../controllers/mniveshAdminControllers/AdminFdController');

// Blogs Routes
router.post("/blogs/create", BlogRoute.createNewBlog);
router.post("/blogs/update", BlogRoute.updateBlog);
router.delete("/blogs/delete/:slug", BlogRoute.deleteBlog);
router.get("/blogs", BlogRoute.getBlogsSearch);
router.get("/blogs/:slug", BlogRoute.getBlog);

// Fds Routes
router.post("/fds/update", FdsRoute.UpdateFds);
router.post("/fds", FdsRoute.GetFdsSearch);


module.exports = router;