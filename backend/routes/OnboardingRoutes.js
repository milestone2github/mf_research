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
   
} = require('../controllers/onboardingControllers/newJoineeDetailsControllers');

const verifyUser = require('../middlewares/VerifyUser');
const verifyToken = require('../middlewares/verifyToken');
const { uploadEducationDocs } = require('../middlewares/uploadEducationDocs');


const { sendOtpSms, verifyOtp, otpVerifiedStatus } = require('../controllers/onboardingControllers/otpController');
const { getCandidateStatus } = require('../controllers/onboardingControllers/springVerifyControllers');
const { ndaSignedWebhook, newEmployeeSetup } = require('../controllers/onboardingControllers/zohoEmployeeSetUp');

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
router.patch('/onboarding-form', verifyToken, uploadEducationDocs, savePartialUserOnboardingInfo);

router.get('/department', getAllDepartments);
router.get('/roles', getRoles);
router.post('/spring-verify', processSpringVerifyOrNda);
router.post('/nda-sign-webhook', ndaSignedWebhook)

// just included this route for testing purpose 

// router.get('/springStatus',  async (req, res) => {
//   try {
//     const userId = "682ed10db8aec0bd6663f73f";
//     const email = "mbelwal05@gmail.com";

//     const result = await getCandidateStatus(userId, email);

//     // ✅ Always return the response
//     return res.status(200).json(result);
//   } catch (err) {
//     console.error('[TEST-ROUTE] Error:', err);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Internal server error',
//     });
//   }
// });



module.exports = router;
