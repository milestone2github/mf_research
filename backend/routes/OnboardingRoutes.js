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
  getHrOnboardingData,
  updateHrDetailsAndResendOffer,
  retryGotra,
  retryNotify,
  updateExistingUserOnboardingInfo,
  getAllEmployeesForEdit,
  getOfferLetterTemplate,
} = require('../controllers/onboardingControllers/newJoineeDetailsControllers');
const multer = require("multer");
const upload = multer();

const verifyUser = require('../middlewares/VerifyUser');
const { verifyToken } = require('../middlewares/verifyToken');
const { uploadOnboardingDocs } = require('../middlewares/uploadOnboardingDocs');


const { sendOtp, verifyOtp, otpVerifiedStatus } = require('../controllers/onboardingControllers/otpController');
const { ndaSignedWebhook, newEmployeeSetup,retryZohoSetup, zohoFlowCallback } = require('../controllers/onboardingControllers/zohoEmployeeSetUp');
const { embeddedsigning, ndaSignStatusDbUpdate } = require('../utils/ndaUrlWorkFlow');

const router = require('express').Router(); 


router.post('/onboarding-form', upload.single("offerLetterPdf"), saveJoineeDetails);
router.get('/onboarding-status', statusDetailsAllJoinee);
router.get('/onboarding-details', statusDetails);
router.get('/onboarding-details/:id', statusDetailsById);
router.get("/offer-letter/template", getOfferLetterTemplate);
router.put('/zohosetup', newEmployeeSetup);
router.post('/retry-zoho-setup/:userId', retryZohoSetup);
router.post('/retry-gotra/:userId', retryGotra);
router.post('/retry-notify/:userId', retryNotify);
router.patch('/update-allocation-status/:userId', verifyUser, updateAssetAllocationStatus);
router.get('/onboarding-form/:userId',getHrOnboardingData);
router.get("/employee-onboarding/all", verifyUser, getAllEmployeesForEdit);
router.put('/onboarding-form/:userId',upload.single("offerLetterPdf"),updateHrDetailsAndResendOffer);


router.post('/otp/send', sendOtp);

router.post('/otp/verify', verifyOtp);
router.get('/check-session', otpVerifiedStatus);

router.get('/me', verifyToken, fetchUserOnboardingInfo);
router.put('/me', verifyUser, upload.any(), updateExistingUserOnboardingInfo);
router.put('/user-filled-info/:userId', verifyUser, upload.any(), updateExistingUserOnboardingInfo);
router.patch('/onboarding-form', verifyToken, uploadOnboardingDocs, savePartialUserOnboardingInfo);

router.get('/department', getAllDepartments);
router.get('/roles', getRoles);
router.post('/spring-verify', processSpringVerifyOrNda);
router.post('/nda-sign-webhook', ndaSignedWebhook)
router.post('/webhook/add-employee', zohoFlowCallback);

router.delete('/delete/:id', deleteJoinee);
router.get('/embeddedsigning', verifyToken, embeddedsigning);
router.get('/ndaSignStatus', ndaSignStatusDbUpdate);

module.exports = router;
