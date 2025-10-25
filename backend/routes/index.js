const { Router } = require("express");
const router = Router();
const assetRoutes = require("./AssetRoutes");
const userRoutes = require("./User");
const dataRoutes = require('./Data');
const opsRoutes = require('./opsDash/OpsRoutes');
const mintRoutes = require('./Mint');
const AdminRoute = require("./mniveshAdminRoutes/mniveshAdminRoutes");
const OnboardingRoutes = require('./OnboardingRoutes');
const rbacRoutes = require('./centralRbacRoutes');
const payoutRoutes = require('./PayoutRoutes');
const RouteOptimization = require('./RouteOptimization');
const LeaderboardRoutes = require('./LeaderboardRoutes');
const marketingTemplateRoutes = require('./MarketingTemplateRoutes');

router.use("/assets", assetRoutes);
router.use('/users', userRoutes);
router.use("/data", dataRoutes);
router.use('/ops-dash', opsRoutes);
router.use('/mint', mintRoutes);
router.use('/mnivesh/admin',AdminRoute);
router.use('/onboarding', OnboardingRoutes);
router.use('/rbac', rbacRoutes);
router.use('/payout', payoutRoutes);
router.use('/route-plan', RouteOptimization);
router.use("/leaderboard", LeaderboardRoutes);
router.use("/marketing-template", marketingTemplateRoutes);

module.exports = router;