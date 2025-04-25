const { Router } = require("express");
const router = Router();
const assetRoutes = require("./AssetRoutes");
const userRoutes = require("./User");
const dataRoutes = require('./Data');
const opsRoutes = require('./opsDash/OpsRoutes');
const mintRoutes = require('./Mint');
const AdminRoute = require("./mniveshAdminRoutes/mniveshAdminRoutes");
const OnboardingRoutes = require('./OnboardingRoutes');

router.use("/assets", assetRoutes);
router.use('/users', userRoutes);
router.use("/data", dataRoutes);
router.use('/ops-dash', opsRoutes);
router.use('/mint', mintRoutes);
router.use('/mnivesh/admin',AdminRoute);
router.use('/api/onboarding', OnboardingRoutes);

module.exports = router;