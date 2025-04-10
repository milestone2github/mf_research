const { getIpAddress, getMintLoginUrl } = require('../controllers/MintController')
const verifyUser = require('../middlewares/VerifyUser')

const router = require('express').Router()

router.get('/onboarding-form', getIpAddress)
router.post('/access', verifyUser, getMintLoginUrl)

module.exports = router