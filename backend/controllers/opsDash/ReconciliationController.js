const Transactions = require("../../models/Transactions")
const { toTitleCase } = require("../../utils/formatString")
const { generateTransactionTableHTML } = require("../../utils/generateTransactionTable")
const sendEmail = require("../../utils/sendEmail")

exports.getRecoTransactions = async (req, res) => {
  let { minDate, maxDate, amcName, schemeName, rmName, type, sort, minAmount, maxAmount, searchBy, searchKey } = req.query
  const items = Number(req.query.items) || 20
  const page = Number(req.query.page) || 1
  const skipItems = items * (page - 1)
  let filters = {}
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
  if (type === 'Switch') { filters.category = 'switch' }
  else if (type) {
    filters.transactionType = type
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

  let addStage = {
    shouldReconcile: {
      $cond: {
        if: { $eq: ["$hasFractions", false] },
        then: {
          $in: ["$status", ["APPROVED", "RECONCILIATION_PENDING_REQUEST", "RECONCILIATION_HOLD_REQUEST", "RECONCILIATION_FAILED_REQUEST"]]
        },
        else: {
          $allElementsTrue: [
            {
              $map: {
                input: "$transactionFractions",
                in: {
                  $in: ["$$this.status", [
                    "APPROVED",
                    "RECONCILED", 
                    "RECONCILIATION_PENDING_REQUEST",
                    "RECONCILIATION_PENDING", 
                    "RECONCILIATION_HOLD_REQUEST",
                    "RECONCILIATION_HOLD", 
                    "RECONCILIATION_FAILED_REQUEST", 
                    "RECONCILIATION_FAILED"
                  ]]
                }
              }
            }
          ]
        }
      }
    }
  };


  filters.shouldReconcile = true

  try {
    const transactions = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: filters },
      { $sort: sortBy },
      { $skip: skipItems },
      { $limit: items }
    ])

    const totalCountAndTotalAmount = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: filters },
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
        transactions,
      }
    })
  } catch (error) {
    console.log('Error getting transactions: ', error.message)
    res.status(500).json({ error: `Error getting transactions: ${error.message}` })
  }
}

exports.updateRecoTransactions = async (req, res) => {
  const trxId = req.params.id;
  const userId = req.user?._id;
  const userEmail = req.user?.email;
  const { status, fractionId, ...optionalFields } = req.body;
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
      minor_issues: 'RECONCILIATION_PENDING',
      major_issues: 'RECONCILIATION_HOLD_REQUEST',
      rejected: 'RECONCILIATION_FAILED_REQUEST',
    };

    const baseUpdate = {};
    const reconciliation = {
      reconciledBy: userId,
      reconciledAt: Date.now(),
      ...optionalFields,
    }

    if (fractionId) {
      // Update a specific fraction
      baseUpdate['transactionFractions.$.status'] = statusMap[status];
      baseUpdate['transactionFractions.$.reconciliation'] = reconciliation;

      transaction = await updateTransactionFraction(trxId, fractionId, baseUpdate);
    } else {
      // Update the main transaction
      baseUpdate.status = statusMap[status];
      baseUpdate.reconciliation = reconciliation;

      transaction = await updateMainTransaction(trxId, baseUpdate);
    }

    if (!transaction) {
      throw new Error('Transaction not found or update failed');
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
        // ccAddress: 'pramod@niveshonline.com,mona@niveshonline.com,vilakshan@niveshonline.com' //debug
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
    let transaction;

    // status map 
    const statusMap = {
      RECONCILIATION_FAILED_REQUEST: 'RECONCILIATION_FAILED',
      RECONCILIATION_HOLD_REQUEST: 'RECONCILIATION_HOLD',
    };

    const baseUpdate = {};
    const managementApproval = {
      approvedBy: userId,
      approvedAt: Date.now(),
    }

    if (fractionId && Number(approve) === 1) {
      // Update a specific fraction
      baseUpdate['transactionFractions.$.status'] = statusMap[status];
      baseUpdate['transactionFractions.$.managementApproval'] = managementApproval;

      transaction = await updateTransactionFraction(trxId, fractionId, baseUpdate);
    } else {
      // Update the main transaction
      baseUpdate.status = statusMap[status];
      baseUpdate.managementApproval = managementApproval;

      transaction = await updateMainTransaction(trxId, baseUpdate);
    }

    if (!transaction) {
      throw new Error('Transaction not found or update failed');
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
