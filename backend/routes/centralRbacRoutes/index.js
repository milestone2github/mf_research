const { Router } = require("express");
const userRouter = require("./userRoutes");
const permissionRouter = require("./permissionRoutes");
const departmentRouter = require("./departmentRoutes");
const roleRouter = require("./roleRoutes");
const categoryRouter = require("./categoryRoutes");
const nfoHyperlinkRouter = require("./nfoHyperlink");
const adminRouter = require("./adminRoutes");
const verifyAdmin = require("../../middlewares/centralRbacVerifyAdmin");

const router = Router();

/* Task (Enhancement): Modify the errors for client to be more elaborate */
router.use("/users", verifyAdmin, userRouter);
router.use("/permissions", verifyAdmin, permissionRouter);
router.use("/depts", verifyAdmin, departmentRouter);
router.use("/roles", verifyAdmin, roleRouter);
router.use("/categories", verifyAdmin, categoryRouter);
router.use("/nfohyperlinks", verifyAdmin, nfoHyperlinkRouter);
router.use("/admin", verifyAdmin, adminRouter);

module.exports = router;