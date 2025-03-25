// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');
const FdsRoute = require('../../controllers/mniveshAdminControllers/AdminFdController');

// Blogs Routes
router.post("/blogs/create", BlogRoute.NewBlogCreate);
router.post("/blogs/update", BlogRoute.UpdateBlog);
router.post("/blogs/delete", BlogRoute.DeleteBlog);
router.post("/blogs", BlogRoute.GetBlogsSearch);

// Fds Routes
router.post("/fds/update", FdsRoute.UpdateFds);
router.post("/fds", FdsRoute.GetFdsSearch);


module.exports = router;