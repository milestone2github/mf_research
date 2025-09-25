const express = require('express');
const { getInsurancePayoutData, requestEarlyRelease, updateInsurancePayoutAccounts } = require('../controllers/PayoutController');
const router = express.Router();

router.get('/insurance-data', getInsurancePayoutData);
router.post('/early-release', requestEarlyRelease);
router.post('/update-insurance-accounts', updateInsurancePayoutAccounts);

module.exports = router;