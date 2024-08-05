const { getGroupedTransactions, getTransactionsBySession, addNewFraction, removeFraction, getTransactionsGroupByFhAndRm, getTransactionsByFamilyHeadAndRm, addAllFractions, generateLink, filteredTransactions, getAllAmcNames, getSchemeNames, getRMNames, nfoTransactions } = require('../controllers/OpsTransactions');

const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/group-by-fhrm', getTransactionsGroupByFhAndRm); //new
router.get('/transactions-by-session', getTransactionsBySession);
router.get('/transactions-of-fhrm', getTransactionsByFamilyHeadAndRm); //new
router.patch('/generate-link/:id', generateLink); //new
router.patch('/fraction/add/:id', addNewFraction);
router.patch('/fraction/add-all/:id', addAllFractions);
router.patch('/fraction/remove/:id', removeFraction);
router.get('/filtered-transactions', filteredTransactions);
router.get('/nfo-transactions', nfoTransactions);
router.get('/amc', getAllAmcNames);
router.get('/scheme', getSchemeNames);
router.get('/rm-names', getRMNames);

module.exports = router