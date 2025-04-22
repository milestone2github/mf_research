const { Router } = require("express");
const router = Router();
const assetRouter = require("./AssetRoutes");

router.use("/assets", assetRouter);

module.exports = router;