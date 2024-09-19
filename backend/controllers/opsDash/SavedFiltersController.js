const OpsFilter = require("../../models/OpsFilters")

exports.getSavedFilters = async (req, res) => {
  const user = req.user._id

  try {
    const filter = await OpsFilter.findOne({ user }).lean()
    if (!filter) {
      return res.status(404).json({ error: 'No saved filter found' })
    }

    return res.status(200).json({ message: 'fetched saved filters', data: filter })

  } catch (error) {
    console.error('Error getting saved filters: ', error.message)
    res.status(500).json({ error: error.message })
  }
}

// route to add saved filters 
exports.addSavedFilters = async (req, res) => {
  const user = req.user._id;
  const { at, reco } = req.body;
  const maxSize = 3; //saved filters limit

  if (!at && !reco) {
    return res.status(400).json({ error: 'Please provide a filter to save' })
  }

  try {
    const currentFilter = await OpsFilter.findOne({ user });

    if (!currentFilter) {
      return OpsFilter.create({
        user,
        allTrxFilters: at ? { values: [at], activeIdx: 0 } : {values: []},
        reconciliationFilters: reco ? { values:  [reco] } : {values: []},
      }).then(filter => {
        console.log('created new doc') //test
        return res.status(200).json({ message: 'Saved filters updated successfully', data: filter });
      })
    }

    if (at) {
      let { values, activeIdx } = currentFilter.allTrxFilters
      if (values.length >= maxSize && activeIdx > 0) {
        activeIdx -= 1;
      }
      if (values.length >= maxSize) {
        values.shift();
      }
      values.push(at);
      currentFilter.allTrxFilters = { values, activeIdx }
    }

    if (reco) {
      let { values, activeIdx } = currentFilter.reconciliationFilters
      if (values.length >= maxSize && activeIdx > 0) {
        activeIdx -= 1;
      }
      if (values.length >= maxSize) {
        values.shift();
      }
      values.push(reco);
      currentFilter.reconciliationFilters = { values, activeIdx }
    }

    await currentFilter.save()

    return res.status(200).json({ message: 'Saved filters updated successfully', data: currentFilter });

  } catch (error) {
    console.error('Error updating saved filters: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// route to remove a saved filter 
exports.removeSavedFilters = async (req, res) => {
  const user = req.query.userid;//test
  // const user = req.user._id;
  const { at, reco } = req.body;

  if (!at && !reco) {
    return res.status(400).json({ error: 'Please provide a filter to remove' })
  }

  try {
    const currentFilter = await OpsFilter.findOne({ user });

    if (!currentFilter) {
      return res.status(404).json({ error: 'No saved filter found' });
    }

    if (at) {
      let { values, activeIdx } = currentFilter.allTrxFilters
      let toRemoveIdx = values.indexOf(at)
      if(toRemoveIdx < 0) {throw new Error('No saved filter found')}

      if(toRemoveIdx === 0 && values.length > 1) {
        activeIdx = 0
      }
      else if(toRemoveIdx <= activeIdx) {
        activeIdx -= 1
      }

      values.splice(toRemoveIdx, 1)
      currentFilter.allTrxFilters = {values, activeIdx}
    }

    if (reco) {
      let { values, activeIdx } = currentFilter.reconciliationFilters
      let toRemoveIdx = values.indexOf(reco)
      if(toRemoveIdx < 0) {throw new Error('No saved filter found')}

      if(toRemoveIdx === 0 && values.length > 1) {
        activeIdx = 0
      }
      else if(toRemoveIdx <= activeIdx) {
        activeIdx -= 1
      }

      values.splice(toRemoveIdx, 1)
      currentFilter.reconciliationFilters = {values, activeIdx}
    }

    await currentFilter.save()

    return res.status(200).json({ message: 'filter removed', data: currentFilter });

  } catch (error) {
    console.error('Error removing filter: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// route to update active a saved filter 
exports.updateActiveSavedFilters = async (req, res) => {
  const user = req.user._id;
  const atIdx = Number(req.query.atIdx);
  const recoIdx = Number(req.query.recoIdx);
  const maxLimit = 5

  if(!atIdx && !recoIdx) {
    return res.status(400).json({ error: 'Please provide a valid index' })
  }

  if (atIdx < 0 || atIdx > (maxLimit-1) || recoIdx < 0 || recoIdx > (maxLimit-1)) {
    return res.status(400).json({ error: 'Please provide a valid index' })
  }

  let update = {}
  if (atIdx) { update["allTrxFilters.activeIdx"] = atIdx }
  if (recoIdx) { update["reconciliationFilters.activeIdx"] = recoIdx }

  try {
    const currentFilter = await OpsFilter.findOneAndUpdate({ user }, update, { new: true }).lean();

    if (!currentFilter) {
      return res.status(404).json({ error: 'No saved filter found or no changes made' });
    }

    return res.status(200).json({ message: 'active filter updated', data: currentFilter });

  } catch (error) {
    console.error('Error updating active filter: ', error.message);
    res.status(500).json({ error: error.message });
  }
};