const { Router } = require("express");
const router = Router();
const assetRoutes = require("./AssetRoutes");
const dataRoutes = require('./Data');
const opsRoutes = require('./opsDash/OpsRoutes');
const mintRoutes = require('./Mint');
const AdminRoute = require("./mniveshAdminRoutes/mniveshAdminRoutes");

router.use("/assets", assetRoutes);
router.use("/data", dataRoutes);
router.use('/ops-dash', opsRoutes);
router.use('/mint', mintRoutes);
router.use('/mnivesh/admin',AdminRoute);

module.exports = router;