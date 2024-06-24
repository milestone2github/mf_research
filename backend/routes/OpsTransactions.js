const { getGroupedTransactions, getTransactionsBySession, addNewFraction, removeFraction } = require('../controllers/OpsTransactions');

const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/transactions-by-session', getTransactionsBySession);
router.patch('/fraction/add/:id', addNewFraction);
router.patch('/fraction/remove/:id', removeFraction);

module.exports = router