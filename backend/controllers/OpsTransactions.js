const NewFundOffer = require("../models/NewFundOffer");
const Transactions = require("../models/Transactions");

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

// get transactions group by family head + rm 
const getTransactionsGroupByFhAndRm = async (req, res) => {
  let uptoDate = new Date()
  if (uptoDate.getDay() == 6) {
    uptoDate.setDate(uptoDate.getDate() + 2)
  }
  else {
    uptoDate.setDate(uptoDate.getDate() + 1)
  }

  try {
    // get all transactions group by "family head + rm" 
    const pipeline = [
      { $match: { transactionPreference: { $lte: uptoDate } } },
      { $addFields: { familyHeadRegistrantName: { $concat: ["$familyHead", "-", "$registrantName"] } } },
      {
        $group: {
          "_id": '$familyHeadRegistrantName',
          count: { $sum: 1 },
          investorName: { $first: "$investorName" },
          familyHead: { $first: "$familyHead" },
          registrantName: { $first: "$registrantName" },
          createdAt: { $min: "$transactionPreference" },
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

// get transactions of matching family head and RM group by category 
const getTransactionsByFamilyHeadAndRm = async (req, res) => {
  const { fh, rm } = req.query;
  if (!fh || !rm) {
    return res.status(400).json({ error: 'family head and registrant name are required to get transactions' })
  }

  let uptoDate = new Date()
  if (uptoDate.getDay() == 6) {
    uptoDate.setDate(uptoDate.getDate() + 2)
  }
  else {
    uptoDate.setDate(uptoDate.getDate() + 1)
  }

  try {
    const transactions = await Transactions.aggregate([
      { $match: { $and: [{ transactionPreference: { $lte: uptoDate } }, { familyHead: fh }, { registrantName: rm }] } },
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

  try {
    // Ensure the new fraction is provided
    if (!fractions.length) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    let trxFractions = fractions.map(item => {
      if (item.fractionAmount) {
        return {
          fractionAmount: Number(item.fractionAmount),
          status: item.status,
          addedBy: item.addedBy || 'RM name', //test
          linkStatus: item.linkStatus || 'initialized',
          transactionDate: item.transactionDate || Date.now()
        }
      }
    })
    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      $set: { transactionFractions: trxFractions },
      linkStatus: 'locked'
    }, { new: true })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Fractions added', data: transaction });
  } catch (error) {
    console.error("Error adding fraction: ", error.message);
    res.status(500).json({ error: `Error adding fractions: ${error.message}` });
  }
}

// generate link (by trx id)
const generateLink = async (req, res) => {
  let { fractionId, platform, orderId } = req.body;

  try {
    let transaction;
    // Ensure the new fraction is provided
    if (!fractionId) {
      transaction = await Transactions.findByIdAndUpdate(req.params.id, { linkStatus: 'generated', orderId }, { new: true })
    }
    else {
      // Update the document by pushing the new fraction to the array
      transaction = await Transactions.findOneAndUpdate(
        { _id: req.params.id, 'transactionFractions._id': fractionId },
        {
          $set: {
            'transactionFractions.$.linkStatus': 'generated',
            'transactionFractions.$.orderId': orderId,
          }
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
  const {amc} = req.query

  if(!amc) {
    return res.status(400).json({error: 'AMC name is required'})
  }

  try {
    const collection = req.milestoneDb.collection("mfschemesDb");

    let result = await collection.aggregate([{
      $match: {"FUND NAME":  amc}
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
    const collection = req.milestoneDb.collection("MintDb");

    let result = await collection.aggregate([{
      $match: {"RELATIONSHIP  MANAGER": { $exists: true, $type: "string"}}
    },{
      $group: {
        _id: "$RELATIONSHIP  MANAGER"
      }
    }, {
      $sort: {_id: 1}
    }]).toArray();

    if (!result) {
      throw new Error("Unable to get RM names")
    }

    result = result.map(item => item._id)
    res.status(200).json({ data: result, message: 'Fetched RM names' });
  } catch (error) {
    console.error("Error fetching RM names", error.message);
    res.status(500).json({ error: `Error while fetching RM names: ${error.message}` });
  }
}

// get all transactions with filter 
const filteredTransactions = async (req, res) => {
  let { minDate, maxDate, amcName, schemeName, rmName, type, orderId, sort, minAmount, maxAmount } = req.query
  const items = Number(req.query.items) || 10
  const page = Number(req.query.page) || 1
  const skipItems = items * (page - 1)
  let filters = {}

  if (minDate) {
    minDate = new Date(minDate)
    filters.transactionPreference = { $gte: minDate }
  }
  if (maxDate) {
    maxDate = new Date(maxDate)
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
    filters.schemeName = Array.isArray(schemeName) ? { $in: schemeName } : schemeName
  }
  if (rmName) {
    filters.registrantName = Array.isArray(rmName) ? { $in: rmName } : rmName
  }
  if (type) {
    filters.transactionType = type
  }
  if (orderId) {
    filters.orderId = orderId
  }

  const sortMap = new Map()
  sortMap.set('trxdate-asc', {transactionPreference: 1})
  sortMap.set('trxdate-desc', {transactionPreference: -1})
  sortMap.set('amount-asc', {amount: 1})
  sortMap.set('amount-desc', {amount: -1})
  let sortBy = sortMap.get(sort || 'trxdate-desc')


  try {
    const transactions = await Transactions.find(filters).sort(sortBy).skip(skipItems).limit(items).lean()
    if (!transactions) {
      throw new Error('Something went wrong, unable to find transactions')
    }

    res.status(200).json({ data: {transactions, page}, message: 'Transactions found' })
  } catch (error) {
    console.log("error getting filtered transactions: ", error.message)
    res.status(500).json({ error: error.message })
  }
}

// get all NFO transactions 
const nfoTransactions = async (req, res) => {
  const items = Number(req.query.items) || 10
  const page = Number(req.query.page) || 1
  const skipItems = items * (page - 1)
  
  try {
    const transactions = await NewFundOffer.find().sort({createdAt: -1}).skip(skipItems).limit(items).lean()
    if (!transactions) {
      throw new Error('Something went wrong, unable to find transactions')
    }

    res.status(200).json({ data: {transactions, page}, message: 'Transactions found' })
  } catch (error) {
    console.log("error getting NFO transactions: ", error.message)
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  getGroupedTransactions,
  getTransactionsBySession,
  addNewFraction,
  removeFraction,
  getTransactionsGroupByFhAndRm,
  getTransactionsByFamilyHeadAndRm,
  addAllFractions,
  generateLink,
  getAllAmcNames,
  getSchemeNames,
  getRMNames,
  filteredTransactions,
  nfoTransactions
}