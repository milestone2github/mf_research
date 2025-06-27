const Employee = require("../../models/Employee");
const NewFundOffer = require("../../models/NewFundOffer");
const OpsFilter = require("../../models/OpsFilters");
const Transactions = require("../../models/Transactions");
const { toTitleCase } = require("../../utils/formatString");
const { approvalStatusMap } = require("../../utils/maps");
const ExcelJS = require('exceljs');
const dayjs = require('dayjs');

// NOT IN USE
const getGroupedTransactions = async (req, res) => {
  try {
    // const systematicTransactions = await Systematic.findOneAndUpdate({sessionId: '1718177502407kis7907'}, {status: 'PENDING'}, {new: true})
    // get all transactions group by "sessionId" 
    const pipeline = [
      {
        $group: {
          "_id": '$sessionId',
          count: { $sum: 1 },
          investorName: { $first: "$investorName" },
          // investorNames: {$addToSet: "$investorName"},
          familyHead: { $first: "$familyHead" },
          createdAt: { $first: "$createdAt" },
          totalPending: {
            $sum: {
              $cond: [{ $eq: ["$status", 'PENDING'] }, 1, 0]
            }
          },
          sysPending: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ["$status", 'PENDING'] },
                  { $eq: ["$category", 'systematic'] }
                ]
              }, 1, 0]
            }
          },
          purchRedempPending: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ["$status", 'PENDING'] },
                  { $eq: ["$category", 'purchredemp'] }
                ]
              }, 1, 0]
            }
          },
          switchPending: {
            $sum: {
              $cond: [{
                $and: [
                  { $eq: ["$status", 'PENDING'] },
                  { $eq: ["$category", 'switch'] }
                ]
              }, 1, 0]
            }
          },
        }
      },
      {
        $sort: { createdAt: 1 },
      }
    ];

    const transactions = await Transactions.aggregate(pipeline)

    res.status(200).json({
      message: 'found grouped transactions',
      data: transactions
    })
  } catch (error) {
    console.log('Error finding grouped transactions', error.message)
    res.status(500).json({ error: `Error finding grouped transactions: ${error.message}` })
  }
}

// get transactions of a sessionId group by category // NOT IN USE
const getTransactionsBySession = async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required get find transactions' })
  }

  try {
    const transactions = await Transactions.aggregate([
      { $match: { sessionId: sessionId } },
      {
        $group: {
          _id: '$category',
          transactions: { $push: '$$ROOT' }
        }
      }
    ])

    if (!transactions) {
      throw new Error('Transactions not found!')
    }

    res.status(200).json({ message: 'Found transactions of a sessionId', data: transactions })
  } catch (error) {
    res.status(500).json({ error: `Error getting transactions of a sessionId: ${error.message}` })
  }
}

// add a new fraction to a transaction (by trx id) // NOT IN USE
const addNewFraction = async (req, res) => {
  let { fractionAmount, status } = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      $push: {
        transactionFractions: {
          fractionAmount,
          status,
          addedBy: 'RM name', //test
          linkStatus: 'generated'
        }
      }
    }, { new: true })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Fraction added', data: transaction });
  } catch (error) {
    console.error("Error adding fraction: ", error.message);
    res.status(500).json({ error: `Error adding fraction: ${error.message}` });
  }
}

// remove a fraction from a transaction (by trx id)
const removeFraction = async (req, res) => {
  let { fractionId } = req.body;

  try {
    // Ensure the new fraction is provided
    if (!fractionId) {
      return res.status(400).json({ error: 'Fraction id is required to delete' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findOneAndUpdate(
      { _id: req.params.id, 'transactionFractions._id': fractionId },
      {
        $set: {
          'transactionFractions.$.linkStatus': 'deleted'
        }
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Fraction deleted', data: transaction });
  } catch (error) {
    console.error("Error deleting fraction: ", error.message);
    res.status(500).json({ error: `Error deleting fraction: ${error.message}` });
  }
}

// get transactions group by family head
const getTransactionsGroupByFh = async (req, res) => {
  const { searchBy, searchKey } = req.query
  const smFilter = req.query.smFilter || 'all'
  const userName = req.user?.name

  const searchByLookup = {
    'family head': 'familyHead',
    'investor name': 'investorName',
    'PAN': 'panNumber',
  }

  let sortBy = { createdAt: 1 }
  let matchStage = {}
  let uptoDate = new Date()
  if (uptoDate.getDay() == 6) {
    uptoDate.setDate(uptoDate.getDate() + 2)
  }
  else {
    uptoDate.setDate(uptoDate.getDate() + 1)
  }

  matchStage.transactionPreference = { $lte: uptoDate }
  if (smFilter === 'my') {
    matchStage.serviceManager = toTitleCase(userName)
    sortBy.createdAt = -1
  }
  else if (smFilter === 'ua') {
    matchStage.serviceManager = { $in: [null, ''] }
  }

  if (searchBy && searchKey) {
    matchStage[searchByLookup[searchBy]] = { $regex: new RegExp(searchKey.trim(), 'i') }
  }

  try {
    // get all transactions group by "family head + rm" 
    const pipeline = [
      { $match: matchStage },

      {
        $addFields: {
          // familyHeadRelationshipManager: { $concat: ["$familyHead", "-", { $ifNull: ["$relationshipManager", ""]}] },
          transactionCount: {
            $cond: [
              { $eq: [{ $size: "$transactionFractions" }, 0] },
              1,
              { $size: "$transactionFractions" }
            ]
          },

          pendingCounts: {
            $reduce: {
              input: {
                $cond: [
                  { $eq: [{ $size: "$transactionFractions" }, 0] },
                  [{ status: "$status" }],
                  "$transactionFractions"
                ]
              },
              initialValue: { total: 0, sys: 0, purchRedemp: 0, switch: 0 },
              in: {
                total: {
                  $cond: [
                    { $eq: ["$$this.status", 'PENDING'] },
                    { $add: ["$$value.total", 1] },
                    "$$value.total"
                  ]
                },
                sys: {
                  $cond: [
                    { $and: [{ $eq: ["$$this.status", 'PENDING'] }, { $eq: ["$category", 'systematic'] }] },
                    { $add: ["$$value.sys", 1] },
                    "$$value.sys"
                  ]
                },
                purchRedemp: {
                  $cond: [
                    { $and: [{ $eq: ["$$this.status", 'PENDING'] }, { $eq: ["$category", 'purchredemp'] }] },
                    { $add: ["$$value.purchRedemp", 1] },
                    "$$value.purchRedemp"
                  ]
                },
                switch: {
                  $cond: [
                    { $and: [{ $eq: ["$$this.status", 'PENDING'] }, { $eq: ["$category", 'switch'] }] },
                    { $add: ["$$value.switch", 1] },
                    "$$value.switch"
                  ]
                }
              }
            }
          }
        }
      },

      { $match: { "pendingCounts.total": { $gt: 0 } } },

      {
        $group: {
          _id: "$familyHead",
          count: { $sum: "$transactionCount" },
          investorName: { $first: "$investorName" },
          familyHead: { $first: "$familyHead" },
          relationshipManager: { $first: "$relationshipManager" },
          serviceManager: { $first: "$serviceManager" },
          createdAt: { $min: "$transactionPreference" },
          totalPending: { $sum: "$pendingCounts.total" },
          sysPending: { $sum: "$pendingCounts.sys" },
          purchRedempPending: { $sum: "$pendingCounts.purchRedemp" },
          switchPending: { $sum: "$pendingCounts.switch" }
        }
      },

      { $sort: sortBy }
    ];

    const transactions = await Transactions.aggregate(pipeline)

    res.status(200).json({
      message: 'found grouped transactions',
      data: transactions
    })
  } catch (error) {
    console.log('Error finding grouped transactions', error.message)
    res.status(500).json({ error: `Error finding grouped transactions: ${error.message}` })
  }
}

// get transactions of matching family head group by category 
const getTransactionsFilterByFamilyHead = async (req, res) => {
  const { fh } = req.query;
  const smFilter = req.query.smFilter || 'all'
  const userName = req.user?.name

  if (!fh) {
    return res.status(400).json({ error: 'family head is required to get transactions' })
  }

  // if its Saturday set it to upcoming Monday otherwise the next Day
  let uptoDate = new Date()
  if (uptoDate.getDay() == 6) {
    uptoDate.setDate(uptoDate.getDate() + 2)
  }
  else {
    uptoDate.setDate(uptoDate.getDate() + 1)
  }

  let matchStage = { transactionPreference: { $lte: uptoDate }, familyHead: fh }
  if (smFilter === 'my') {
    matchStage.serviceManager = toTitleCase(userName)
  }
  else if (smFilter === 'ua') {
    matchStage.serviceManager = { $in: [null, ''] }
  }

  let past3days = new Date()
  past3days.setDate(past3days.getDate() - 3)

  let addStage = {
    pendingOrRejectedRecently: {
      $cond: {
        if: { $eq: ["$hasFractions", false] },
        then: {
          $or: [
            { $eq: ["$status", "PENDING"] },
            {
              $and: [
                { $eq: ["$status", "REJECTED"] },
                { $gte: ['$updatedAt', past3days] }
              ]
            }
          ]
        },
        else: {
          $anyElementTrue: [{
            $map: {
              input: "$transactionFractions",
              in: {
                $or: [
                  { $eq: ["$$this.status", "PENDING"] },
                  {
                    $and: [
                      { $eq: ["$$this.status", "REJECTED"] },
                      { $gte: ['$updatedAt', past3days] }
                    ]
                  }
                ]
              }
            }
          }]
        }
      }
    }
  }

  matchStage.pendingOrRejectedRecently = true

  try {
    const transactions = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: matchStage },
      { $sort: { investorName: 1, transactionPreference: 1 } },
      {
        $group: {
          _id: '$category',
          transactions: { $push: '$$ROOT' }
        }
      }
    ])

    if (!transactions) {
      throw new Error('Transactions not found!')
    }


    res.status(200).json({ message: 'Found transactions', data: transactions })
  } catch (error) {
    console.log('Error getting transactions: ', error.message)
    res.status(500).json({ error: `Error getting transactions: ${error.message}` })
  }
}

// add all fractions at once to a transaction (by trx id)
const addAllFractions = async (req, res) => {
  let { fractions } = req.body;
  const userName = toTitleCase(req.user.name)

  try {
    let trxFractions = []
    let linkStatus = 'unlocked'
    let hasFractions = false

    if (fractions?.length) {
      trxFractions = fractions.map(item => {
        let status = item.status
        if (item.approvalStatus) {
          status = approvalStatusMap.get(item.approvalStatus)
        }
        if (item.fractionAmount) {
          return {
            fractionAmount: Number(item.fractionAmount),
            status: status,
            addedBy: userName,
            linkStatus: item.linkStatus || 'initialized',
            folioNumber: item.folioNumber,
            approvalStatus: item.approvalStatus,
            transactionDate: item.transactionDate || Date.now()
          }
        }
      })
      linkStatus = 'locked'
      hasFractions = true
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      $set: { transactionFractions: trxFractions },
      linkStatus,
      hasFractions
    }, { new: true })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Fractions updated', data: transaction });
  } catch (error) {
    console.error("Error updating fraction: ", error.message);
    res.status(500).json({ error: `Error updating fractions: ${error.message}` });
  }
}

// generate link (by trx id)
const generateLink = async (req, res) => {
  let { fractionId, platform, orderId, approvalStatus, paymentMode } = req.body;
  const userId = req.user?._id;

  try {
    if (['Client Declined', 'RM Declined'].includes(approvalStatus)) {
      throw new Error(`Change the approval status from ${approvalStatus} first`)
    }

    // update the approvalStatus and status 
    approvalStatus = 'Approved'
    let status = 'APPROVED'

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required!' })
    }

    // validations
    let validations = {
      validatedBy: userId,
      validatedAt: Date.now(),
      status: status
    }

    let transaction;
    if (!fractionId) {
      transaction = await Transactions.findByIdAndUpdate(
        req.params.id,
        {
          linkStatus: 'generated',
          orderId,
          orderPlatform: platform,
          approvalStatus,
          ...(status ? { status } : {}),
          ...(paymentMode ? { paymentMode } : {}),
          $push: { validations }
        },
        { new: true }
      )
    }
    else {
      transaction = await Transactions.findOneAndUpdate(
        { _id: req.params.id, 'transactionFractions._id': fractionId },
        {
            'transactionFractions.$.linkStatus': 'generated',
            'transactionFractions.$.orderId': orderId,
            'transactionFractions.$.approvalStatus': approvalStatus,
            'transactionFractions.$.orderPlatform': platform,
            ...(status ? { 'transactionFractions.$.status': status } : {}),
            ...(paymentMode ? { paymentMode: paymentMode } : {}),
            $push: { 'transactionFractions.$.validations': validations }
          },
        { new: true }
      )
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Link generated', data: transaction });
  } catch (error) {
    console.error("Error generating link: ", error.message);
    res.status(500).json({ error: `Error generating link: ${error.message}` });
  }
}

// generate link (by trx id)
const updateOrderId = async (req, res) => {
  let { fractionId, orderId, platform } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required!' })
  }

  try {
    let transaction;
    // Ensure the new fraction is provided
    if (!fractionId) {
      transaction = await Transactions.findByIdAndUpdate(req.params.id, { orderId, orderPlatform: platform }, { new: true })
    }
    else {
      // Update the document by pushing the new fraction to the array
      transaction = await Transactions.findOneAndUpdate(
        { _id: req.params.id, 'transactionFractions._id': fractionId },
        {
          $set: {
            'transactionFractions.$.orderId': orderId,
          }
        },
        { new: true }
      )
    }

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Order ID updated', data: transaction });
  } catch (error) {
    console.error("Error updating Order ID: ", error.message);
    res.status(500).json({ error: `Error updating Order ID: ${error.message}` });
  }
}

// get all AMC names 
const getAllAmcNames = async (req, res) => {
  try {
    const collection = req.milestoneDb.collection("mfschemesDb");

    let result = await collection.aggregate([{
      $group: {
        _id: "$FUND NAME",
      },
    }]).toArray();

    if (!result) {
      throw new Error("Unable to get AMC names")
    }

    result = result.map(item => item._id)
    res.status(200).json({ data: result, message: 'Fetched AMC names' });
  } catch (error) {
    console.error("Error fetching AMC names", error.message);
    res.status(500).json({ error: `Error while fetching AMC names: ${error.message}` });
  }
}

// get all scheme names of an amc 
const getSchemeNames = async (req, res) => {
  const { amc } = req.query

  if (!amc) {
    return res.status(400).json({ error: 'AMC name is required' })
  }

  try {
    const collection = req.milestoneDb.collection("mfschemesDb");

    let result = await collection.aggregate([{
      $match: { "FUND NAME": amc }
    }, {
      $group: {
        _id: "$scheme_name",
      },
    }]).toArray();

    if (!result) {
      throw new Error("Unable to get scheme names")
    }

    result = result.map(item => item._id)
    res.status(200).json({ data: result, message: 'Fetched scheme names' });
  } catch (error) {
    console.error("Error fetching scheme names", error.message);
    res.status(500).json({ error: `Error while fetching scheme names: ${error.message}` });
  }
}

// get all RM names 
const getRMNames = async (req, res) => {

  try {
    let result = await Employee.find({ role: 'relationship manager' }).lean();

    if (!result) {
      throw new Error("Unable to get RM names")
    }

    result = result.map(item => item.name)
    res.status(200).json({ data: result, message: 'Fetched RM names' });
  } catch (error) {
    console.error("Error fetching RM names", error.message);
    res.status(500).json({ error: `Error while fetching RM names: ${error.message}` });
  }
}

// get all SM names 
const getSMNames = async (req, res) => {

  try {
    let result = await Employee.find({ role: 'service manager' }).lean();

    if (!result) {
      throw new Error("Unable to get SM names")
    }

    result = result.map(item => item.name)
    res.status(200).json({ data: result, message: 'Fetched SM names' });
  } catch (error) {
    console.error("Error fetching RM names", error.message);
    res.status(500).json({ error: `Error while fetching RM names: ${error.message}` });
  }
}

// get all transactions with filter (all.jsx page)
const filteredTransactions = async (req, res) => {
  let {
    minDate, maxDate, amcName, schemeName, rmName, type, orderId, sort,
    minAmount, maxAmount, smName, transactionFor, status, approvalStatus, searchBy, searchKey, reconcileStatus
  } = req.query;
  schemeName = schemeName?.replace(/\(G\)$/, '')?.trim();

  const items = Number(req.query.items) || 10;
  const page = Number(req.query.page) || 1;
  const skipItems = items * (page - 1);

  let filterStage1 = {};
  let filterStage2 = {};
  let fractionFilters = {};

  const searchByLookup = {
    'family head': 'familyHead',
    'investor name': 'investorName',
    'PAN': 'panNumber',
  };

  // Stage 1 filters
  if (minDate) {
    minDate = new Date(minDate);
    filterStage1.transactionPreference = { $gte: minDate };
  }
  if (maxDate) {
    maxDate = new Date(maxDate);
    maxDate.setUTCHours(23, 59, 59)
    filterStage1.transactionPreference = { $lte: maxDate };
  }
  if (minDate && maxDate) {
    filterStage1.transactionPreference = { $gte: minDate, $lte: maxDate };
  }

  if (amcName) {
    filterStage1.amcName = Array.isArray(amcName) ? { $in: amcName } : amcName;
  }
  if (schemeName) {
    filterStage1.$or = [
      { schemeName: schemeName },
      { fromSchemeName: schemeName }
    ];
  }
  if (rmName) {
    filterStage1.relationshipManager = Array.isArray(rmName) ? { $in: rmName.map(name => toTitleCase(name)) } : toTitleCase(rmName);
  }
  if (orderId) {
    filterStage1.orderId = orderId;
  }
  if (smName) {
    filterStage1.serviceManager = Array.isArray(smName) ? { $in: smName.map(name => toTitleCase(name)) } : toTitleCase(smName);
  }
  if (transactionFor) {
    filterStage1.transactionFor = transactionFor;
  }

  if (type === 'Switch') {
    filterStage1.category = 'switch';
  } else if (type) {
    filterStage1.transactionType = type;
  }

  // stage 2 filters 
  // Ensure status and reconcileStatus are arrays
  if (status && !Array.isArray(status)) {
    status = [status];
  }
  if (reconcileStatus && !Array.isArray(reconcileStatus)) {
    reconcileStatus = [reconcileStatus];
  }

  // Stage 2 filters for status
  if (status) {
    const includeStatuses = status.filter(s => !s.startsWith('NOT-'));
    const excludeStatuses = status.filter(s => s.startsWith('NOT-')).map(s => s.slice(4));

    if (includeStatuses.length || excludeStatuses.length) {
      filterStage2.status = {};
      fractionFilters['transactionFractions.status'] = {};

      if (includeStatuses.length) {
        filterStage2.status.$in = includeStatuses;
        fractionFilters['transactionFractions.status'].$in = includeStatuses;
      }
      if (excludeStatuses.length) {
        filterStage2.status.$nin = excludeStatuses;
        fractionFilters['transactionFractions.status'].$nin = excludeStatuses;
      }
    }
  }

  // Stage 2 filters for reconcileStatus
  if (reconcileStatus && reconcileStatus.length) {
    const hasNotExist = reconcileStatus.includes('NOT-EXIST');
    reconcileStatus = reconcileStatus.filter(status => status !== 'NOT-EXIST');
  
    if (hasNotExist) {
      const conditions = [{ $exists: false }];
      if (reconcileStatus.length) {
        conditions.unshift({ $in: reconcileStatus });
      }
      filterStage2['$or'] = conditions.map(condition => ({ 'reconciliation.reconcileStatus': condition }));
      fractionFilters['$or'] = conditions.map(condition => ({ 'transactionFractions.reconciliation.reconcileStatus': condition }));
    } else {
      filterStage2['reconciliation.reconcileStatus'] = { $in: reconcileStatus };
      fractionFilters['transactionFractions.reconciliation.reconcileStatus'] = { $in: reconcileStatus };
    }
  }

  if (approvalStatus) {
    filterStage2.approvalStatus = approvalStatus;
    fractionFilters['transactionFractions.approvalStatus'] = approvalStatus;
  }

  if (minAmount?.toString()) {
    filterStage2.amount = { $gte: Number(minAmount) };
    fractionFilters['transactionFractions.fractionAmount'] = { $gte: Number(minAmount) };
  }
  if (maxAmount?.toString()) {
    filterStage2.amount = { $lte: Number(maxAmount) };
    fractionFilters['transactionFractions.fractionAmount'] = { $lte: Number(maxAmount) };
  }
  if (minAmount?.toString() && maxAmount?.toString()) {
    filterStage2.amount = { $gte: Number(minAmount), $lte: Number(maxAmount) };
    fractionFilters['transactionFractions.fractionAmount'] = { $gte: Number(minAmount), $lte: Number(maxAmount) };
  }

  if (searchBy && searchKey) {
    filterStage1[searchByLookup[searchBy]] = { $regex: new RegExp(searchKey.trim(), 'i') };
  }

  // sorting options
  const sortMap = new Map();
  sortMap.set('trxdate-asc', { transactionPreference: 1 });
  sortMap.set('trxdate-desc', { transactionPreference: -1 });
  sortMap.set('amount-asc', { amount: 1 });
  sortMap.set('amount-desc', { amount: -1 });
  let sortBy = sortMap.get(sort || 'trxdate-desc');

  try {
    // Aggregation for unique serviceManager names
    // const uniqueSMList = await Transactions.aggregate([
    //   { $match: filterStage1 },
    //   { $unwind: { path: '$transactionFractions', preserveNullAndEmptyArrays: true } },
    //   { $match: { $or: [{ hasFractions: false, ...filterStage2 }, { hasFractions: true, ...fractionFilters }] } },
    //   { $group: { _id: '$serviceManager' } }, // Group by serviceManager to get unique values
    //   { $project: { _id: 0, serviceManager: '$_id' } } // Rename field to 'serviceManager'
    // ]);

    const paginatedTransactions = await Transactions.aggregate([
      { $match: filterStage1 },
      { $unwind: { path: '$transactionFractions', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { hasFractions: false, ...filterStage2 },
            { hasFractions: true, ...fractionFilters }
          ]
        }
      },
      { $sort: sortBy },
      { $skip: skipItems },
      { $limit: items }
    ]);

    const totalCountAndAmount = await Transactions.aggregate([
      { $match: filterStage1 },
      { $unwind: { path: '$transactionFractions', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { hasFractions: false, ...filterStage2 },
            { hasFractions: true, ...fractionFilters }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ['$hasFractions', false] },
                '$amount',
                '$transactionFractions.fractionAmount'
              ]
            }
          }
        }
      }
    ]);

    const totalCount = totalCountAndAmount[0]?.totalCount || 0
    const totalAmount = totalCountAndAmount[0]?.totalAmount || 0

    res.status(200).json({
      data: {
        page,
        totalCount,
        totalAmount,
        transactions: paginatedTransactions,
        // uniqueSMList: uniqueSMList.map(item => item.serviceManager)
      },
      message: 'Transactions found'
    });
  } catch (error) {
    console.log('error getting filtered transactions: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// update approval status 
const updateApprovalStatus = async (req, res) => {
  const transactionId = req.params.id
  const approvalStatus = req.body.approvalStatus
  const fractionId = req.body.fractionId
  const userId = req.user?._id;

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction Id is required' })
  }
  // if (!approvalStatus) {
  //   return res.status(400).json({ error: 'Approval status is required' })
  // }

  const status = approvalStatusMap.get(approvalStatus)
  try {
    let transaction;

    let validations = {
      validatedBy: userId,
      validatedAt: Date.now(),
      status: status
    }

    if (!fractionId) {
      const update = { approvalStatus, status, $push: {validations} }
      transaction = await Transactions.findByIdAndUpdate(transactionId, update, { new: true }).lean()
    }

    else {
      const update = {
        'transactionFractions.$.status': status,
        'transactionFractions.$.approvalStatus': approvalStatus,
        $push: {'transactionFractions.$.validations': validations}
      }
      transaction = await Transactions.findOneAndUpdate({
        _id: transactionId, 'transactionFractions._id': fractionId
      }, update, { new: true }).lean()
    }
    if (!transaction) {
      throw new Error("Transaction not found")
    }

    res.status(200).json({ message: 'Status updated', data: transaction })
  } catch (error) {
    console.error('Error updating status: ', error.message)
    res.status(500).json({ error: error.message })
  }
}

// update preference date using id 
const updateTransaction = async (req, res) => {
  const transactionId = req.params.id
  const { transactionPreference, sipSwpStpDate } = req.body

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction Id is required' })
  }
  let update = {}
  if (transactionPreference) {
    update.transactionPreference = transactionPreference
  }
  if (sipSwpStpDate) {
    update.sipSwpStpDate = sipSwpStpDate
  }

  try {
    const transaction = await Transactions.findByIdAndUpdate(transactionId, update, { new: true }).lean()

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    res.status(200).json({ message: 'Transaction updated', data: transaction })
  } catch (error) {
    console.error('Error updating transaction: ', error.message)
    res.status(500).json({ error: error.message })
  }
}

// set service manager 
const setServiceManager = async (req, res) => {
  const { fh, rm, sm } = req.query;

  if (!fh || !rm) {
    return res.status(400).json({ error: 'Family head and relationship manager are required' });
  }

  try {
    // Update all matching transactions
    const result = await Transactions.updateMany(
      { familyHead: fh, relationshipManager: rm },
      { $set: { serviceManager: toTitleCase(sm) } }
    );

    // If no transactions were updated, send a 404 error
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No transactions found to update service manager' });
    }

    res.status(200).json({
      message: 'Updated service manager', data: {
        familyHead: fh,
        relationshipManager: rm,
        serviceManager: sm,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating service manager: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// update note
const updateNote = async (req, res) => {
  const transactionId = req.params.id
  const note = req.body.note
  const fractionId = req.body.fractionId

  if (!transactionId) {
    return res.status(400).json({ error: 'Transaction Id is required' })
  }
  if (!note) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  try {
    let transaction;
    if (!fractionId) {
      transaction = await Transactions.findByIdAndUpdate(transactionId, { note }, { new: true }).lean()
    }

    else {
      transaction = await Transactions.findOneAndUpdate({
        _id: transactionId, 'transactionFractions._id': fractionId
      }, { 'transactionFractions.$.note': note, }, { new: true }).lean()
    }
    if (!transaction) {
      throw new Error("Transaction not found")
    }

    res.status(200).json({ message: 'Note updated', data: transaction })
  } catch (error) {
    console.error('Error updating note: ', error.message)
    res.status(500).json({ error: error.message })
  }
};

// get all NFO transactions 
const nfoTransactions = async (req, res) => {
  const items = Number(req.query.items) || 10
  const page = Number(req.query.page) || 1
  const skipItems = items * (page - 1)

  try {
    const transactions = await NewFundOffer.find().sort({ createdAt: -1 }).skip(skipItems).limit(items).lean()
    if (!transactions) {
      throw new Error('Something went wrong, unable to find transactions')
    }

    res.status(200).json({ data: { transactions, page }, message: 'Transactions found' })
  } catch (error) {
    console.log("error getting NFO transactions: ", error.message)
    res.status(500).json({ error: error.message })
  }
}

// TEMPORARY set relationship manager 
const setRelationshipManager = async (req, res) => {
  const { rn } = req.query;
  const rmMap = {
    'Ishu Mavar': 'Ishu Mavar',
    'Sagar Maini': 'Sagar Maini',
    'Ved Prakash Sharma': 'Pramod Bhutani',
    'ruby': 'Ruby',
    'Yatin Munjal': 'Yatin Munjal',
    'test_user': 'Test Relationship Manager'
  }

  try {
    // Update all matching transactions
    const result = await Transactions.updateMany(
      { registrantName: rn, relationshipManager: null },
      { $set: { relationshipManager: rmMap[rn] } || req.query.rm }
    );

    // If no transactions were updated, send a 404 error
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'No transactions found to update relationship manager' });
    }

    res.status(200).json({
      message: 'Updated relationship manager', data: {
        registrantName: rn,
        relationshipManager: rmMap[rn] || req.query.rm,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error updating relationship manager: ', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Export the transactions in excel
const exportAllTransactions = async (req, res) => {

  const permissions = req.user?.permissions || [];

  if (!permissions.includes('export_all_transactions_data')) {
    return res.status(403).json({ error: 'Export Permission denied' });
  }

  try {
    let {
      minDate,
      maxDate,
      amcName,
      schemeName,
      rmName,
      type,
      orderId,
      sort,
      minAmount,
      maxAmount,
      smName,
      transactionFor,
      status,
      approvalStatus,
      searchBy,
      searchKey,
      reconcileStatus
    } = req.query;

    schemeName = schemeName?.replace(/\(G\)$/, '').trim();
    if (status && !Array.isArray(status)) status = [status];
    if (reconcileStatus && !Array.isArray(reconcileStatus)) reconcileStatus = [reconcileStatus];

    // Mongo filters
    const filterStage1 = {};
    const filterStage2 = {};
    const fractionFilters = {};
    const searchByLookup = {
      'family head': 'familyHead',
      'investor name': 'investorName',
      'PAN': 'panNumber'
    };

    // Stage 1: date range
    if (minDate) {
      const d = new Date(minDate);
      filterStage1.transactionPreference = { $gte: d };
    }
    if (maxDate) {
      const d = new Date(maxDate);
      d.setUTCHours(23, 59, 59);
      filterStage1.transactionPreference = filterStage1.transactionPreference
        ? { ...filterStage1.transactionPreference, $lte: d }
        : { $lte: d };
    }

    // Stage 1: other simple fields
    if (amcName) filterStage1.amcName = Array.isArray(amcName) ? { $in: amcName } : amcName;
    if (schemeName) filterStage1.$or = [
      { schemeName },
      { fromSchemeName: schemeName }
    ];
    if (rmName) {
      const val = Array.isArray(rmName)
        ? rmName.map(n => toTitleCase(n))
        : toTitleCase(rmName);
      filterStage1.relationshipManager = Array.isArray(rmName) ? { $in: val } : val;
    }
    if (orderId) filterStage1.orderId = orderId;
    if (smName) {
      const val = Array.isArray(smName)
        ? smName.map(n => toTitleCase(n))
        : toTitleCase(smName);
      filterStage1.serviceManager = Array.isArray(smName) ? { $in: val } : val;
    }
    if (transactionFor) filterStage1.transactionFor = transactionFor;
    if (type === 'Switch') filterStage1.category = 'switch';
    else if (type) filterStage1.transactionType = type;
    if (searchBy && searchKey) {
      filterStage1[searchByLookup[searchBy]] = { $regex: new RegExp(searchKey.trim(), 'i') };
    }

    // Stage 2: status filters
    if (status) {
      const include = status.filter(s => !s.startsWith('NOT-'));
      const exclude = status.filter(s => s.startsWith('NOT-')).map(s => s.slice(4));
      if (include.length) {
        filterStage2.status = { $in: include };
        fractionFilters['transactionFractions.status'] = { $in: include };
      }
      if (exclude.length) {
        filterStage2.status = filterStage2.status || {};
        filterStage2.status.$nin = exclude;
        fractionFilters['transactionFractions.status'] = fractionFilters['transactionFractions.status'] || {};
        fractionFilters['transactionFractions.status'].$nin = exclude;
      }
    }

    // Stage 2: reconcileStatus
    if (reconcileStatus?.length) {
      const hasNotExist = reconcileStatus.includes('NOT-EXIST');
      const rs = reconcileStatus.filter(s => s !== 'NOT-EXIST');
      if (hasNotExist) {
        const conds = rs.length
          ? [{ $in: rs }, { $exists: false }]
          : [{ $exists: false }];
        filterStage2.$or = conds.map(c => ({ 'reconciliation.reconcileStatus': c }));
        fractionFilters.$or = conds.map(c => ({ 'transactionFractions.reconciliation.reconcileStatus': c }));
      } else {
        filterStage2['reconciliation.reconcileStatus'] = { $in: rs };
        fractionFilters['transactionFractions.reconciliation.reconcileStatus'] = { $in: rs };
      }
    }

    // Stage 2: approvalStatus & amount range
    if (approvalStatus) {
      filterStage2.approvalStatus = approvalStatus;
      fractionFilters['transactionFractions.approvalStatus'] = approvalStatus;
    }
    if (minAmount) {
      filterStage2.amount = { $gte: Number(minAmount) };
      fractionFilters['transactionFractions.fractionAmount'] = { $gte: Number(minAmount) };
    }
    if (maxAmount) {
      filterStage2.amount = filterStage2.amount
        ? { ...filterStage2.amount, $lte: Number(maxAmount) }
        : { $lte: Number(maxAmount) };
      fractionFilters['transactionFractions.fractionAmount'] = fractionFilters['transactionFractions.fractionAmount']
        ? { ...fractionFilters['transactionFractions.fractionAmount'], $lte: Number(maxAmount) }
        : { $lte: Number(maxAmount) };
    }

    // Sorting
    const sortMap = new Map([
      ['trxdate-asc', { transactionPreference: 1 }],
      ['trxdate-desc', { transactionPreference: -1 }],
      ['amount-asc', { amount: 1 }],
      ['amount-desc', { amount: -1 }]
    ]);
    const sortBy = sortMap.get(sort) || sortMap.get('trxdate-desc');

    // Aggregate ALL matching docs
    const allTxns = await Transactions.aggregate([
      { $match: filterStage1 },
      { $unwind: { path: '$transactionFractions', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { hasFractions: false, ...filterStage2 },
            { hasFractions: true, ...fractionFilters }
          ]
        }
      },
      { $sort: sortBy }
    ]);

    // Build Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Transactions');
    sheet.columns = [
      { header: 'S. No.',              key: 'sNo',                   width: 10 },
      { header: 'Status',              key: 'status',                width: 15 },
      { header: 'Transaction date',    key: 'transactionDate',       width: 20 },
      { header: 'Execution date',      key: 'executionDate',         width: 20 },
      { header: 'Transaction type',    key: 'transactionType',       width: 20 },
      { header: 'Pan number',          key: 'panNumber',             width: 15 },
      { header: 'Investor name',       key: 'investorName',          width: 25 },
      { header: 'Family head',         key: 'familyHead',            width: 25 },
      { header: 'RM name',             key: 'relationshipManager',   width: 25 },
      { header: 'AMC name',            key: 'amcName',               width: 25 },
      { header: 'Scheme name',         key: 'schemeName',            width: 25 },
      { header: 'Amount',              key: 'amount',                width: 15 },
      { header: 'Units',               key: 'transactionUnits',      width: 15 },
      { header: 'From scheme',         key: 'fromScheme',            width: 20 },
      { header: 'SM name',             key: 'serviceManager',        width: 25 },
      { header: 'Folio No.',           key: 'folioNo',               width: 20 },
      { header: 'From scheme option',  key: 'fromSchemeOption',      width: 20 },
      { header: 'Scheme Option',       key: 'schemeOption',          width: 20 },
      { header: 'Frequency',           key: 'frequency',             width: 15 },
      { header: 'Registrant',          key: 'registrantName',        width: 20 },
      { header: 'Transaction for',     key: 'transactionFor',        width: 20 },
      { header: 'Payment mode',        key: 'paymentMode',           width: 20 },
      { header: 'First trx amount',    key: 'firstTransactionAmount',width: 20 },
      { header: 'SIP/SWP/STP date',    key: 'sipSwpStpDate',         width: 20 },
      { header: 'SIP Pause month',     key: 'sipPauseMonth',         width: 20 },
      { header: 'Tenure of SIP',       key: 'tenure',                width: 15 },
      { header: 'Approval Status',     key: 'approvalStatus',        width: 20 },
      { header: 'Order ID',            key: 'orderId',               width: 20 },
      { header: 'Cheque No.',          key: 'chequeNumber',          width: 20 },
    ];

    allTxns.forEach((txn, idx) => {
      sheet.addRow({
        sNo: idx + 1,
        status: txn.status,
        transactionDate: dayjs(txn.transactionPreference).format('YYYY-MM-DD'),
        executionDate: txn.createdAt ? dayjs(txn.createdAt).format('YYYY-MM-DD') : '',
        transactionType: txn.transactionType,
        panNumber: txn.panNumber,
        investorName: txn.investorName,
        familyHead: txn.familyHead,
        relationshipManager: txn.relationshipManager,
        amcName: txn.amcName,
        schemeName: txn.schemeName,
        amount: txn.hasFractions ? txn.transactionFractions.fractionAmount : txn.amount,
        transactionUnits: txn.transactionUnits || '',
        fromScheme: txn.fromSchemeName || '',
        serviceManager: txn.serviceManager,
        folioNo: txn.folioNumber || '',
        fromSchemeOption: txn.fromSchemeOption || '',
        schemeOption: txn.schemeOption || '',
        frequency: txn.frequency || '',
        registrantName: txn.registrantName || '',
        transactionFor: txn.transactionFor,
        paymentMode: txn.paymentMode || '',
        firstTransactionAmount: txn.firstTransactionAmount || '',
        sipSwpStpDate: txn.sipSwpStpDate ? dayjs(txn.sipSwpStpDate).format('YYYY-MM-DD') : '',
        sipPauseMonth: txn.sipPauseMonth || '',
        tenure: txn.tenure || '',
        approvalStatus: txn.approvalStatus,
        orderId: txn.orderId,
        chequeNumber: txn.chequeNumber || ''
      });
    });

    // Stream file to client
    const ts = dayjs().utcOffset(330).format('YYYYMMDD_HHmm');
    const filename = `export_${ts}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting the data in excel format: ', error.message)
    res.status(500).json({ error: error.message })
  }
};

// Fetch unique SM Names from Transactions
const getAllSMNames = async (_req, res) => {
  try {
    const uniqueSMList = await Transactions.aggregate([
      {
        $group: {
          _id: '$serviceManager'
        }
      },
      {
        $project: {
          _id: 0,
          serviceManager: '$_id'
        }
      },
      {
        $sort: { serviceManager: 1 }
      }
    ]);

    res.status(200).json({
      data: uniqueSMList.map(item => item.serviceManager),
      message: 'All unique service managers fetched'
    });
  } catch (error) {
    console.log('Error fetching service managers:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Fetch Unique RM Names from Transactions {ToDo Improvements: Merge getAllSMNames and getAllRMNames into one}
const getAllRMNames = async (_req, res) => {
  try {
    const uniqueRMList = await Transactions.aggregate([
      {
        $group: {
          _id: '$relationshipManager'
        }
      },
      {
        $project: {
          _id: 0,
          relationshipManager: '$_id'
        }
      },
      {
        $sort: { relationshipManager: 1 }
      }
    ]);

    res.status(200).json({
      data: uniqueRMList.map(item => item.relationshipManager),
      message: 'All unique relationship managers fetched'
    });
  } catch (error) {
    console.log('Error fetching relationship managers:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGroupedTransactions,
  getTransactionsBySession,
  addNewFraction,
  removeFraction,
  getTransactionsGroupByFh,
  getTransactionsFilterByFamilyHead,
  addAllFractions,
  generateLink,
  getAllAmcNames,
  getSchemeNames,
  getRMNames,
  filteredTransactions,
  nfoTransactions,
  updateApprovalStatus,
  updateOrderId,
  updateTransaction,
  getSMNames,
  setServiceManager,
  updateNote,
  setRelationshipManager, //TEMPORARY
  exportAllTransactions,
  getAllSMNames,  // New
  getAllRMNames,  // New
}