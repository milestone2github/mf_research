// const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const BlogRoute = require('../../controllers/mniveshAdminControllers/AdminBlogControllers');

router.post("/blogs/create", BlogRoute.NewBlogCreate);

router.post("/blogs/update", BlogRoute.UpdateBlog);
router.post("/blogs/delete", BlogRoute.DeleteBlog);
router.post("/blogs/delete", BlogRoute.UpdateBlog);
router.post("/blogs", BlogRoute.GetBlogsSearch);


module.exports = router;