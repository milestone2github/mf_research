const { getGroupedTransactions, getTransactionsBySession, addNewFraction, removeFraction, addAllFractions, generateLink, filteredTransactions, getAllAmcNames, getSchemeNames, getRMNames, nfoTransactions, updateApprovalStatus, updateOrderId, updatePreferenceDate, getSMNames, setServiceManager, updateNote, setRelationshipManager, getTransactionsGroupByFh, getTransactionsFilterByFamilyHead, getRecoTransactions } = require('../controllers/OpsTransactions');
const verifyUser = require('../middlewares/VerifyUser')
const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/group-by-fhrm', verifyUser, getTransactionsGroupByFh); //new
router.get('/transactions-by-session', getTransactionsBySession);
router.get('/transactions-of-fhrm', verifyUser, getTransactionsFilterByFamilyHead); //new
router.patch('/generate-link/:id', generateLink); //new
router.patch('/order-id/:id', updateOrderId); //new
router.patch('/fraction/add/:id', addNewFraction);
router.patch('/fraction/add-all/:id', verifyUser, addAllFractions);
router.patch('/fraction/remove/:id', removeFraction);
router.get('/filtered-transactions', filteredTransactions);
router.get('/nfo-transactions', nfoTransactions);
router.get('/amc', getAllAmcNames);
router.get('/scheme', getSchemeNames);
router.get('/rm-names', getRMNames);
router.get('/sm-names', getSMNames);
router.patch('/service-manager', setServiceManager);
router.patch('/update-status/:id', updateApprovalStatus);
router.patch('/preference-date/:id', updatePreferenceDate);
router.patch('/note/:id', updateNote);
router.patch('/relationship-manager', setRelationshipManager); //TEMPORARY

// RECONCILLATION ROUTES 
router.get('/reconciliation',  getRecoTransactions)

module.exports = router