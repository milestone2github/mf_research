const { saveJoineeDetails } = require('../controllers/onboardingControllers/newJoineeDetailsControllers')
const verifyUser = require('../middlewares/VerifyUser')

const router = require('express').Router()

router.post('/onboarding-form', saveJoineeDetails);
// router.get('/onboarding-status', verifyUser, statusDetailsAllJoinee);
// router.get('/onboarding-status', verifyUser, statusDetails);

module.exports = router