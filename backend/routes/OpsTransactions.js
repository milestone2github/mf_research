const { getGroupedTransactions, getSystematicTransactions, getPurchRedempTransactions, getSwitchTransactions, addSystematicFractions, addPurchRedempFractions, addSwitchFractions } = require('../controllers/OpsTransactions');

const router = require('express').Router();

router.get('/', getGroupedTransactions);
router.get('/systematic', getSystematicTransactions);
router.get('/purchredemp', getPurchRedempTransactions);
router.get('/switch', getSwitchTransactions);
router.patch('/systematic/:id/fractions', addSystematicFractions);
router.patch('/purchredemp/:id/fractions', addPurchRedempFractions);
router.patch('/switch/:id/fractions', addSwitchFractions);

module.exports = router