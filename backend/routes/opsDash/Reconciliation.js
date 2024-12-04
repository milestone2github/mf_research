const { getRecoTransactions, updateRecoTransactions, approveReconciliation } = require('../../controllers/opsDash/ReconciliationController')
const verifyUser = require('../../middlewares/VerifyUser')

const router = require('express').Router()

router.get('/', verifyUser, getRecoTransactions);
router.patch('/:id', verifyUser, updateRecoTransactions);
router.patch('/:id/approve', verifyUser, approveReconciliation);

module.exports = router