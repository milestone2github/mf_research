const Systematic = require("../models/Systematic")

const getGroupedTransactions = async (req, res) => {
  try {
    const systematicTransactions = await Systematic.aggregate[
      {
        $sort: { transactionPreference: 1 },
      },
      { $group: {
        _id: '$sessionId',
        transactions: {$push: '$$ROOT'}
      }}
    ]

    console.log('result: ', systematicTransactions)
  } catch (error) {

  }
}