const Transactions = require("../../models/Transactions")
const { toTitleCase } = require("../../utils/formatString")

exports.getRecoTransactions = async (req, res) => {
  let { minDate, maxDate, amcName, schemeName, rmName, type, sort, minAmount, maxAmount, searchBy, searchKey} = req.query
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
  if(type === 'Switch') {filters.category = 'switch'}
  else if (type) {
    filters.transactionType = type
  }

  if(searchBy && searchKey) {
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
    approved: {
      $cond: {
        if: { $eq: ["$hasFractions", false] },
        then: {
           $eq: ["$status", "APPROVED"] 
        },
        else: {
          $allElementsTrue: [{
            $map: {
              input: "$transactionFractions",
              in: {
                 $eq: ["$$this.status", "APPROVED"]
              }
            }
          }]
        }
      }
    }
  }

  filters.approved = true

  try {
    const transactions = await Transactions.aggregate([
      { $addFields: addStage },
      { $match: filters },
      { $sort: sortBy },
      { $skip: skipItems },
      { $limit: items }
    ])

    const totalCountAndTotalAmount = await Transactions.aggregate([
      {$addFields: addStage},
      {$match: filters},
      {$group: {_id: null, totalCount: {$sum: 1}, totalAmount: {$sum: "$amount"}} }
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