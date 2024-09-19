const { getRecoTransactions } = require('../../controllers/opsDash/ReconciliationController')

const router = require('express').Router()

router.get('/', getRecoTransactions)

module.exports = router