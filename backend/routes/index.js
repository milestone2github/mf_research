const { Router } = require("express");
const router = Router();
const assetRoutes = require("./AssetRoutes");
const dataRoutes = require('./routes/Data');
const opsRoutes = require('./routes/opsDash/OpsRoutes');
const mintRoutes = require('./routes/Mint');
const AdminRoute = require("./routes/mniveshAdminRoutes/mniveshAdminRoutes");

router.use("/assets", assetRoutes);
router.use("/data", dataRoutes);
router.use('/ops-dash', opsRoutes);
router.use('/mint', mintRoutes);
router.use('/mnivesh/admin',AdminRoute);

module.exports = router;