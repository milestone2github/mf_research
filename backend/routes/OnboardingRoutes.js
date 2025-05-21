const {
  saveJoineeDetails,
  statusDetailsAllJoinee,
  statusDetails,
  statusDetailsById,
  updateAllocationStatus,
  fetchUserOnboardingInfo,
  savePartialUserOnboardingInfo,
  newEmployeeSetup,
  getAllDepartments,
  getRoles,
  ndaSignedWebhook,
   
} = require('../controllers/onboardingControllers/newJoineeDetailsControllers');

const verifyUser = require('../middlewares/VerifyUser');
const verifyToken = require('../middlewares/verifyToken');


const { sendOtpSms, verifyOtp, otpVerifiedStatus } = require('../controllers/onboardingControllers/otpController');

const router = require('express').Router(); 


router.post('/onboarding-form', saveJoineeDetails);
router.get('/onboarding-status', statusDetailsAllJoinee);
router.get('/onboarding-details', statusDetails);
router.get('/onboarding-details/:id', statusDetailsById);
router.put('/zohosetup', newEmployeeSetup);
router.patch('/update-allocation-status/:userId', verifyUser, updateAllocationStatus);


router.post('/otp/send', (req, res) => {
  
  if (req.body.phone) return sendOtpSms(req, res);
  return res.status(400).json({ error: 'Phone required' });
});

router.post('/otp/verify', verifyOtp);
router.get('/check-session', otpVerifiedStatus);

router.get('/me', verifyToken, fetchUserOnboardingInfo);
router.patch('/onboarding-form', verifyToken, savePartialUserOnboardingInfo);

router.get('/department', getAllDepartments);
router.get('/roles', getRoles);

router.post('/nda-sign-webhook', ndaSignedWebhook)





module.exports = router;
