const { getGroupedTransactions, getTransactionsBySession, addNewFraction, removeFraction, getTransactionsGroupByFhAndRm, getTransactionsByFamilyHeadAndRm } = require('../controllers/OpsTransactions');

const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/group-by-fhrm', getTransactionsGroupByFhAndRm); //new
router.get('/transactions-by-session', getTransactionsBySession);
router.get('/transactions-of-fhrm', getTransactionsByFamilyHeadAndRm); //new
router.patch('/fraction/add/:id', addNewFraction);
router.patch('/fraction/remove/:id', removeFraction);

module.exports = router