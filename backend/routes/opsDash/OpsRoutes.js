const {
  getGroupedTransactions,
  getTransactionsBySession,
  addNewFraction,
  removeFraction,
  addAllFractions,
  generateLink,
  filteredTransactions,
  getAllAmcNames,
  getSchemeNames,
  getRMNames,
  nfoTransactions,
  updateApprovalStatus,
  updateOrderId,
  getSMNames,
  setServiceManager,
  updateNote,
  setRelationshipManager,
  getTransactionsGroupByFh,
  getTransactionsFilterByFamilyHead,
  updateTransaction,
  exportAllTransactions,
  getAllSMNames,
  getAllRMNames,
} = require('../../controllers/opsDash/OpsTransactions');
const verifyUser = require('../../middlewares/VerifyUser')
const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/group-by-fhrm', verifyUser, getTransactionsGroupByFh); //new
router.get('/transactions-by-session', getTransactionsBySession);
router.get('/transactions-of-fhrm', verifyUser, getTransactionsFilterByFamilyHead); //new
router.patch('/generate-link/:id', verifyUser, generateLink); //new
router.patch('/order-id/:id', updateOrderId); //new
router.patch('/fraction/add/:id', addNewFraction);
router.patch('/fraction/add-all/:id', verifyUser, addAllFractions);
router.patch('/fraction/remove/:id', removeFraction);
router.get('/filtered-transactions', filteredTransactions);
router.get('/get-sm-names', getAllSMNames)      // FETCH ALL SM NAMES FROM TRANSACTIONS
router.get('/get-rm-names', getAllRMNames)      // FETCH ALL RM NAMES FROM TRANSACTIONS
router.get('/nfo-transactions', nfoTransactions);
router.get('/amc', getAllAmcNames);
router.get('/scheme', getSchemeNames);
router.get('/rm-names', getRMNames);
router.get('/sm-names', getSMNames);
router.patch('/service-manager', setServiceManager);
router.patch('/update-status/:id', updateApprovalStatus);
router.patch('/update-transction/:id', updateTransaction);
router.patch('/note/:id', updateNote);
router.patch('/relationship-manager', setRelationshipManager); //TEMPORARY

// Export all the filtered transactions in XLSX file
router.get('/export/filtered-transactions', verifyUser, exportAllTransactions);

// RECONCILLATION ROUTES 
router.use('/reconciliation',  require('./Reconciliation'))

// SAVED FILTERS ROUTES
router.use('/saved-filters', require('./SavedFilters'))

module.exports = router