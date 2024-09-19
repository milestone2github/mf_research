const { getSavedFilters, addSavedFilters, removeSavedFilters, updateActiveSavedFilters } = require('../../controllers/opsDash/SavedFiltersController')

const router = require('express').Router()

router.get('/', getSavedFilters)
router.put('/', addSavedFilters)
router.patch('/', removeSavedFilters)
router.patch('/active', updateActiveSavedFilters)

module.exports = router