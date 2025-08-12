const {
  saveJoineeDetails,
  statusDetailsAllJoinee,
  statusDetails,
  statusDetailsById,
  fetchUserOnboardingInfo,
  savePartialUserOnboardingInfo,
  getAllDepartments,
  getRoles,
  processSpringVerifyOrNda,
  updateAssetAllocationStatus,
   deleteJoinee,
} = require('../controllers/onboardingControllers/newJoineeDetailsControllers');

const verifyUser = require('../middlewares/VerifyUser');
const verifyToken = require('../middlewares/verifyToken');
const { uploadOnboardingDocs } = require('../middlewares/uploadOnboardingDocs');


const { sendOtpSms, verifyOtp, otpVerifiedStatus } = require('../controllers/onboardingControllers/otpController');
const { getCandidateStatus } = require('../controllers/onboardingControllers/springVerifyControllers');
const { ndaSignedWebhook, newEmployeeSetup } = require('../controllers/onboardingControllers/zohoEmployeeSetUp');
const { embeddedsigning, ndaSignStatusDbUpdate } = require('../utils/ndaUrlWorkFlow');

const router = require('express').Router(); 


router.post('/onboarding-form', saveJoineeDetails);
router.get('/onboarding-status', statusDetailsAllJoinee);
router.get('/onboarding-details', statusDetails);
router.get('/onboarding-details/:id', statusDetailsById);
router.put('/zohosetup', newEmployeeSetup);
router.patch('/update-allocation-status/:userId', verifyUser, updateAssetAllocationStatus);


router.post('/otp/send', (req, res) => {
  
  if (req.body.phone) return sendOtpSms(req, res);
  return res.status(400).json({ error: 'Phone required' });
});

router.post('/otp/verify', verifyOtp);
router.get('/check-session', otpVerifiedStatus);

router.get('/me', verifyToken, fetchUserOnboardingInfo);
router.patch('/onboarding-form', verifyToken, uploadOnboardingDocs, savePartialUserOnboardingInfo);

router.get('/department', getAllDepartments);
router.get('/roles', getRoles);
router.post('/spring-verify', processSpringVerifyOrNda);
router.post('/nda-sign-webhook', ndaSignedWebhook)

router.delete('/delete/:id', deleteJoinee);
router.get('/embeddedsigning', verifyToken, embeddedsigning);
router.get('/ndaSignStatus', ndaSignStatusDbUpdate);

module.exports = router;
