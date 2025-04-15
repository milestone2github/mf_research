const { saveJoineeDetails, statusDetailsAllJoinee, statusDetails } = require('../controllers/onboardingControllers/newJoineeDetailsControllers')
const verifyUser = require('../middlewares/VerifyUser')

const router = require('express').Router()

router.post('/onboarding-form', saveJoineeDetails);
router.get('/onboarding-status', statusDetailsAllJoinee);
router.get('/onboarding-details', statusDetails);

module.exports = router