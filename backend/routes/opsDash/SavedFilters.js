const verifyUser = require('../../middlewares/VerifyUser')
const { getSavedFilters, addSavedFilters, removeSavedFilters, updateActiveSavedFilters } = require('../../controllers/opsDash/SavedFiltersController')

const router = require('express').Router()

router.get('/', verifyUser, getSavedFilters)
router.put('/', verifyUser, addSavedFilters)
router.patch('/', verifyUser, removeSavedFilters)
router.patch('/active', verifyUser, updateActiveSavedFilters)

module.exports = router