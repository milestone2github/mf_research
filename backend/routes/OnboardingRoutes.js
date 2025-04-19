const { saveJoineeDetails, statusDetailsAllJoinee, statusDetails, statusDetailsById } = require('../controllers/onboardingControllers/newJoineeDetailsControllers')
const verifyUser = require('../middlewares/VerifyUser')

const router = require('express').Router()

router.post('/onboarding-form', saveJoineeDetails);
router.get('/onboarding-status', statusDetailsAllJoinee);
router.get('/onboarding-details', statusDetails);
router.get('/onboarding-details/:id', statusDetailsById);

module.exports = router