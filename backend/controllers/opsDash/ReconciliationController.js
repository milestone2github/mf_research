const Transactions = require("../../models/Transactions")
const { toTitleCase } = require("../../utils/formatString")
const { generateTransactionTableHTML } = require("../../utils/generateTransactionTable")
const sendEmail = require("../../utils/sendEmail")

exports.getRecoTransactions = async (req, res) => {
  let { minDate, maxDate, amcName, schemeName, rmName, type, sort, minAmount, maxAmount, searchBy, searchKey, reconcileStatus } = req.query
  const items = Number(req.query.items) || 20
  const page = Number(req.query.page) || 1
  const skipItems = items * (page - 1)
  let filters = {}
  let filterStage2 = {};
  const userPermissions = req.user?.permissions || [];

  schemeName = schemeName?.replace(/\(G\)$/, '')?.trim();

  const searchByLookup = {
    'family head': 'familyHead',
    'investor name': 'investorName',
    'PAN': 'panNumber',
  }

  if (minDate) {
    minDate = new Date(minDate)
    filters.transactionPreference = { $gte: minDate }
  }
  if (maxDate) {
    maxDate = new Date(maxDate)
    maxDate.setUTCHours(23, 59, 59)
    filters.transactionPreference = { $lte: maxDate }
  }
  if (minDate && maxDate) {
    filters.transactionPreference = { $gte: minDate, $lte: maxDate }
  }

  if (minAmount?.toString()) {
    filters.amount = { $gte: Number(minAmount) }
  }
  if (maxAmount?.toString()) {
    filters.amount = { $lte: Number(maxAmount) }
  }
  if (minAmount?.toString() && maxAmount?.toString()) {
    filters.amount = { $gte: Number(minAmount), $lte: Number(maxAmount) }
  }

  if (amcName) {
    filters.amcName = Array.isArray(amcName) ? { $in: amcName } : amcName
  }
  if (schemeName) {
    filters.$or = [
      { schemeName: schemeName },
      { fromSchemeName: schemeName }
    ];
  }
  if (rmName) {
    filters.relationshipManager = Array.isArray(rmName) ? { $in: rmName.map(name => toTitleCase(name)) } : toTitleCase(rmName)
  }

   // Type filter
  if (Array.isArray(type)) {

    const isSwitchSelected = type.includes('Switch');
    const typeFilters = [];

    if (isSwitchSelected) {
      typeFilters.push({ category: "switch" });
    }

    const nonSwitchTypes = type.filter(t => t !== "Switch");
    if (nonSwitchTypes.length > 0) {
      typeFilters.push({ transactionType: { $in: nonSwitchTypes } });
    }

    if (typeFilters.length > 0) {
      filters.$or = typeFilters;
    }
    
  } else if (type === "Switch") {
    filters.category = "switch";
  } else if (type) {
    filters.transactionType = type;
  }


  if (searchBy && searchKey) {
    filters[searchByLookup[searchBy]] = { $regex: new RegExp(searchKey.trim(), 'i') }
  }

  // Define sorting options
  const sortMap = new Map()
  sortMap.set('trxdate-asc', { transactionPreference: 1 })
  sortMap.set('trxdate-desc', { transactionPreference: -1 })
  sortMap.set('amount-asc', { amount: 1 })
  sortMap.set('amount-desc', { amount: -1 })
  let sortBy = sortMap.get(sort || 'trxdate-desc')

  let shouldRecoThenCondition = {
    $and: [
      { $eq: ["$status", "APPROVED"] },
      { $not: ["$reconciliation.reconcileStatus"] } // reconcileStatus does not exist
    ]
  }

  
  let shouldRecoElseCondition = {
    $anyElementTrue: [
      {
        $map: {
          input: "$transactionFractions",
          in: {
            $and: [
              { $eq: ["$$this.status", "APPROVED"] },
              { $not: ["$$this.reconciliation.reconcileStatus"] } // reconcileStatus does not exist
            ]
          }
        }
      }
    ]
  }

  if (userPermissions.includes('reconcile_approval_approve')) {
    shouldRecoThenCondition = {
      $or: [
        {
          $and: [
            { $eq: ["$status", "APPROVED"] },
            { $not: ["$reconciliation.reconcileStatus"] } // reconcileStatus does not exist
          ]
        },
        {
          $in: ["$reconciliation.reconcileStatus", [
            "RECONCILED_WITH_MAJOR_REQUESTED",
            "RECONCILIATION_REJECTED_REQUEST"
          ]]
        }
      ]
    }

    shouldRecoElseCondition = {
      $anyElementTrue: [
        {
          $map: {
            input: "$transactionFractions",
            in: {
              $or: [
                {
                  $and: [
                    { $eq: ["$$this.status", "APPROVED"] },
                    { $not: ["$$this.reconciliation.reconcileStatus"] } // reconcileStatus does not exist
                  ]
                },
                {
                  $in: ["$$this.reconciliation.reconcileStatus", [
                    "RECONCILED_WITH_MAJOR_REQUESTED",
                    "RECONCILIATION_REJECTED_REQUEST"
                  ]]
                }
              ]
            }
          }
        }
      ]
    }
  }

  let addStage = {
    shouldReconcile: {
      $cond: {
        if: { $eq: ["$hasFractions", false] },
        then: shouldRecoThenCondition,
        else: shouldRecoElseCondition
      }
    }
  };

  filters.shouldReconcile = true;

  // Ensure reconcileStatus is an array
  if (reconcileStatus && !Array.isArray(reconcileStatus)) {
    reconcileStatus = [reconcileStatus];
  }

  // Stage 2 filters for reconcileStatus
  if (reconcileStatus && reconcileStatus.length) {
    filterStage2 = {
      $or: [
        {
          hasFractions: false, // Main transaction filter (if no fractions exist)
          'reconciliation.reconcileStatus': { $in: reconcileStatus }
        },
        {
          hasFractions: true, // Ensure at least one matching fraction exists
          transactionFractions: {
            $elemMatch: { 'reconciliation.reconcileStatus': { $in: reconcileStatus } }
          }
        }
      ]
    };
  }

  try {
    const transactions = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: filters },
      { $match: filterStage2 },
      { $sort: sortBy },
      { $skip: skipItems },
      { $limit: items }
    ])

    // populate notes (editedBy user)
    const trxIds = transactions.map(t => t._id);
    const populated = await Transactions.find({ _id: { $in: trxIds } })
      .populate("note.editedBy", "name")
      .populate("transactionFractions.note.editedBy", "name")
      .lean();

    // console.log("Populated transactions:", JSON.stringify(populated, null, 2));

    // --- Preserve order from aggregation ---
    // The aggregation defines sort order (sortBy).
    // The second .find() fetches with $in, which does not respect order. // So we use the _id order from aggregation (trxIds) and manually re-sort the populated array to match that order.
    const trxOrder = trxIds.map(id => id.toString());
    populated.sort((a, b) => trxOrder.indexOf(a._id.toString()) - trxOrder.indexOf(b._id.toString()));

    const normalized = populated.map(txn => {
      txn.note = txn.note.map(n => ({
        ...n,
        editedBy: n.editedBy ? { name: n.editedBy.name } : null
      }));
      txn.transactionFractions = txn.transactionFractions.map(fr => {
        fr.note = fr.note.map(n => ({
          ...n,
          editedBy: n.editedBy ? { name: n.editedBy.name } : null
        }));
        return fr;
      });
      return txn;
    });

    // console.log("Normalized notes for frontend:", JSON.stringify(normalized, null, 2));

    const totalCountAndTotalAmount = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: filters },
      { $match: filterStage2 },
      { $group: { _id: null, totalCount: { $sum: 1 }, totalAmount: { $sum: "$amount" } } }
    ])

    if (!transactions) {
      throw new Error('Transactions not found!')
    }

    res.status(200).json({
      message: 'Found transactions',
      data: {
        page,
        totalCount: totalCountAndTotalAmount[0]?.totalCount || 0,
        totalAmount: totalCountAndTotalAmount[0]?.totalAmount || 0,
        transactions: normalized,
      }
    })
  } catch (error) {
    // console.log('Error getting transactions: ', error.message)
    res.status(500).json({ error: `Error getting transactions: ${error.message}` })
  }
}

exports.updateRecoTransactions = async (req, res) => {
  const trxId = req.params.id;
  const userId = req.user?._id;
  const userEmail = req.user?.email;
  const { status, fractionId, note, ...optionalFields } = req.body;
  try {
    let transaction;

    // Validate status
    const validStatuses = ['matched', 'minor_issues', 'major_issues', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid reconciliation status' });
    }

    // status map 
    const statusMap = {
      matched: 'RECONCILED',
      minor_issues: 'RECONCILED_WITH_MINOR',
      major_issues: 'RECONCILED_WITH_MAJOR_REQUESTED',
      rejected: 'RECONCILIATION_REJECTED_REQUEST',
    };

    const update = {};
    const reconciliation = {
      reconciledBy: userId,
      reconciledAt: Date.now(),
      reconcileStatus: statusMap[status],
      ...optionalFields,
    }

    // ===== FRACTION-LEVEL =====
    if (fractionId) {
      if (status === 'minor_issues') {
        transaction = await Transactions.findOne({ _id: trxId, 'transactionFractions._id': fractionId });
        if (!transaction) throw new Error('Transaction not found');

        // Find the fraction
        const fraction = transaction.transactionFractions.find(
          (fraction) => fraction._id.toString() === fractionId
        );

        fraction.reconciliation = reconciliation;

        // add note if provided
        if (note) {
          if (!Array.isArray(fraction.note)) {
            fraction.note = []; // handle legacy string -> reset as array
          }
          fraction.note.push({ note, editedAt: new Date(), editedBy: userId, });
        }

        // swap old values with new 
        swapValues(fraction, 'folioNumber', fraction);
        swapValues(fraction, 'orderId', fraction);
        swapValues(fraction, 'sipSwpStpDate', transaction);
        swapValues(fraction, 'firstTransactionAmount', transaction);
        swapValues(fraction, 'transactionPreference', fraction, 'transactionDate');

        await transaction.save();
      }

      else {
        // Other statuses (major/rejected)
        // Update a specific fraction
        update['transactionFractions.$.reconciliation'] = reconciliation;

        transaction = await updateTransactionFraction(trxId, fractionId, update);

        // Add note for non-minor statuses too
        if (note && transaction) {
          const fraction = transaction.transactionFractions.find(
            (f) => f._id.toString() === fractionId
          );
          if (fraction) {
            if (!Array.isArray(fraction.note)) {
              fraction.note = [];
            }
            fraction.note.push({ note, editedBy: userId, editedAt: new Date(), });
            await transaction.save();
          }
        }
      }
    } else {

      // ===== MAIN TRANSACTION =====
      if (status === 'minor_issues') {
        transaction = await Transactions.findById( trxId );
        if (!transaction) throw new Error('Transaction not found');

        transaction.reconciliation = reconciliation;

        // add note if provided
        if (note) {
          if (!Array.isArray(transaction.note)) {
            transaction.note = [];
          }
          transaction.note.push({ note, editedBy: userId, editedAt: new Date(), });
        }
        // swap old values with new 
        swapValues(transaction, 'folioNumber', transaction);
        swapValues(transaction, 'orderId', transaction);
        swapValues(transaction, 'sipSwpStpDate', transaction);
        swapValues(transaction, 'firstTransactionAmount', transaction);
        swapValues(transaction, 'transactionPreference', transaction);

        await transaction.save();
      }

      else {
        // Other statuses (major/rejected)
        // Update the main transaction
        update.reconciliation = reconciliation;

        transaction = await updateMainTransaction(trxId, update);

        if (note && transaction) {
          if (!Array.isArray(transaction.note)) {
            transaction.note = [];
          }
          transaction.note.push({ note, editedBy: userId, editedAt: new Date(), });
          await transaction.save();
        }
      }
    }

    // After saving, repopulate `editedBy` (both at transaction and fraction level)
    transaction = await Transactions.findById(trxId)
      .populate('note.editedBy', 'name') // main notes
      .populate('transactionFractions.note.editedBy', 'name'); // fraction notes

    if (!transaction) {
      throw new Error('Transaction not found or reconcilliation failed');
    }

    // send mail if major issues | rejected 
    if (['major_issues', 'rejected'].includes(status)) {
      let fractIdx = -1;
      if (fractionId) {
        fractIdx = transaction.transactionFractions.findIndex(item => item._id == fractionId);
      }

      let flag = status === 'rejected' ? 'REJECTED' : 'CONTAINING MAJOR ISSUES';
      mailBody = generateTransactionTableHTML(transaction, flag, fractIdx);
      await sendEmail({
        toAddress: userEmail,
        subject: 'Reconciliation Status Update',
        body: mailBody,
        ccAddress: 'pramod@niveshonline.com,mona@niveshonline.com,vilakshan@niveshonline.com,ops@niveshonline.com,ved@niveshonline.com'
      })
    }
    res.status(200).json({
      message: 'Transaction updated while reconciliation',
      data: transaction,
    });
  } catch (error) {
    console.error('Error updating transaction while reconciliation:', error.message);
    res.status(500).json({ error: `Error updating transaction: ${error.message}` });
  }
};

exports.approveReconciliation = async (req, res) => {
  const trxId = req.params.id;
  const userId = req.user?._id;
  const { status, fractionId, approve } = req.body;

  try {
    // Status map
    const statusMap = {
      RECONCILED_WITH_MAJOR_REQUESTED: 'RECONCILED_WITH_MAJOR',
      RECONCILIATION_REJECTED_REQUEST: 'RECONCILIATION_REJECTED',
    };

    const managementApproval = {
      approvedBy: userId,
      approvedAt: Date.now(),
    };

    const transaction = await Transactions.findById(trxId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (fractionId && Number(approve) === 1) {
      // Find the fraction
      const fraction = transaction.transactionFractions.find(
        (fraction) => fraction._id.toString() === fractionId
      );
      if (!fraction) throw new Error('Fraction not found');

      // Update fraction details
      fraction.reconciliation.reconcileStatus = statusMap[status];
      fraction.managementApproval = managementApproval;

      // Handle major issues for fraction
      if (status === 'RECONCILED_WITH_MAJOR_REQUESTED') {
        swapValues(fraction, 'amount', fraction, 'fractionAmount');
        swapValues(fraction, 'panNumber', transaction);
        swapValues(fraction, 'schemeName', transaction);
      }
    } else {
      // Update the main transaction
      if (Number(approve) === 1) {
        transaction.reconciliation.reconcileStatus = statusMap[status];
        transaction.managementApproval = managementApproval;

        // Handle major issues for main transaction
        if (status === 'RECONCILED_WITH_MAJOR_REQUESTED') {
          swapValues(transaction, 'amount', transaction);
          swapValues(transaction, 'panNumber', transaction);
          swapValues(transaction, 'schemeName', transaction);
        }
      }
    }

    await transaction.save();

    res.status(200).json({
      message: 'Reconciliation approved successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Error approving reconciliation:', error.message);
    res.status(500).json({ error: `Error approving reconciliation: ${error.message}` });
  }
};


// REUSABLE UTITLITY FUNCTIONS
const updateTransactionFraction = async (trxId, fractionId, updates) => {
  return Transactions.findOneAndUpdate(
    { _id: trxId, 'transactionFractions._id': fractionId },
    { $set: updates },
    { new: true }
  );
};

const updateMainTransaction = async (trxId, updates) => {
  return Transactions.findByIdAndUpdate(
    trxId,
    { $set: updates },
    { new: true }
  );
};

const swapValues = (target, field, source, sourceField = field) => {
  const newValue = target.reconciliation[field];
  if (newValue) {
    const oldValue = source[sourceField];
    source[sourceField] = newValue;
    target.reconciliation[field] = oldValue;
  }
};