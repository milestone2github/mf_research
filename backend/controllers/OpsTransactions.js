const PurchRedemp = require("../models/PurchRedemp");
const Switch = require("../models/Switch");
const Systematic = require("../models/Systematic");
const Transactions = require("../models/Transactions");

const getGroupedTransactions = async (req, res) => {
  try {
    // const systematicTransactions = await Systematic.findOneAndUpdate({sessionId: '1718177502407kis7907'}, {status: 'PENDING'}, {new: true})
    // get all transactions group by "sessionId" 
    const pipeline = [
      { $group: {
        "_id": '$sessionId',
        count: {$sum : 1 },
        investorName: {$first: "$investorName"},
        // investorNames: {$addToSet: "$investorName"},
        familyHead: {$first: "$familyHead"},
        createdAt: {$first: "$createdAt"},
        totalPending: {$sum: {
          $cond : [{$eq: ["$status", 'PENDING']}, 1, 0]
        }},
        sysPending: {$sum: {
          $cond: [{$and: [
            {$eq: ["$status", 'PENDING']},
            {$eq: ["$category", 'systematic']}
          ]}, 1, 0]
        }},
        purchRedempPending: {$sum: {
          $cond: [{$and: [
            {$eq: ["$status", 'PENDING']},
            {$eq: ["$category", 'purchredemp']}
          ]}, 1, 0]
        }},
        switchPending: {$sum: {
          $cond: [{$and: [
            {$eq: ["$status", 'PENDING']},
            {$eq: ["$category", 'switch']}
          ]}, 1, 0]
        }},
      }},
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
    res.status(500).json({error: `Error finding grouped transactions: ${error.message}`})
  }
}

// get transactions of a sessionId group by category 
const getTransactionsBySession = async (req, res) => {
  const { sessionId } = req.query;
  if(!sessionId) {
    return res.status(400).json({error: 'sessionId is required get find transactions'})
  }

  try {
    const transactions = await Transactions.aggregate([
      {$match: {sessionId: sessionId}},
      {$group: {
        _id: '$category',
        transactions: {$push: '$$ROOT'}
      }}
    ])

    if(!transactions) {
      throw new Error('Transactions not found!')
    }

    res.status(200).json({message: 'Found transactions of a sessionId', data: transactions})
  } catch (error) {
    res.status(500).json({error: `Error getting transactions of a sessionId: ${error.message}`})
  }
}

// add a new fraction to a transaction (by trx id)
const addNewFraction = async (req, res) => {
  let {fractionAmount, status} = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      $push: {transactionFractions : {
        fractionAmount, 
        status, 
        addedBy: 'RM name', //test
        linkStatus: 'generated'
      }}
    }, {new: true})

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({message: 'Fraction added', data: transaction});
  } catch (error) {
    console.error("Error adding fraction: ", error.message);
    res.status(500).json({ error: `Error adding fraction: ${error.message}` });
  }
}

// remove a fraction from a transaction (by trx id)
const removeFraction = async (req, res) => {
  let {fractionAmount, status, transactionDate, addedBy} = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount || !transactionDate || !addedBy) {
      return res.status(400).json({ error: 'Amount, transanction date, and RM name are required to delete' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Transactions.findByIdAndUpdate(req.params.id, {
      $set: {
        'transactionFraction.$[elem].linkStatus': 'deleted'
      }
    },
    {
      new: true,
      arrayFilters: [
        {
          'elem.fractionAmount': fractionAmount,
          'elem.addedBy': addedBy,
          'elem.transactionDate': transactionDate,
          'elem.status': status,
        }
      ]
    })

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({message: 'Fraction deleted', data: transaction});
  } catch (error) {
    console.error("Error deleting fraction: ", error.message);
    res.status(500).json({ error: `Error deleting fraction: ${error.message}` });
  }
}

const getSystematicTransactions = async (req, res) => {
  const { sessionId } = req.query;
  if(!sessionId) {
    return res.status(400).json({error: 'sessionId is required get find transactions'})
  }

  try {
    const transactions = await Systematic.find({sessionId})
    if(!transactions) {
      throw new Error("Unable to find transactions")
    }
  
    res.status(200).json({message: 'Systematic transactions found', data: transactions})
  } catch (error) {
    console.error("Error while getting systematic transactions, ", error.message)
    res.status(500).json({error: `Error while getting systematic transactions, ${error.message}`})
  }
}

const getPurchRedempTransactions = async (req, res) => {
  const { sessionId } = req.query;
  if(!sessionId) {
    return res.status(400).json({error: 'sessionId is required get transactions'})
  }

  try {
    const transactions = await PurchRedemp.find({sessionId})
    if(!transactions) {
      throw new Error("Unable to find transactions")
    }
  
    res.status(200).json({message: 'Purchase/Redemption transactions found', data: transactions})
  } catch (error) {
    console.error("Error while getting purchase/redemption transactions, ", error.message)
    res.status(500).json({error: `Error while getting purchase/redemption transactions, ${error.message}`})
  }
}

const getSwitchTransactions = async (req, res) => {
  const { sessionId } = req.query;
  if(!sessionId) {
    return res.status(400).json({error: 'sessionId is required get transactions'})
  }

  try {
    const transactions = await Switch.find({sessionId})
    if(!transactions) {
      throw new Error("Unable to find transactions")
    }
  
    res.status(200).json({message: 'Switch transactions found', data: transactions})
  } catch (error) {
    console.error("Error while getting switch transactions, ", error.message)
    res.status(500).json({error: `Error while getting switch transactions, ${error.message}`})
  }
}

const addSystematicFractions = async (req, res) => {
  let {fractionAmount, status} = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Systematic.findByIdAndUpdate(req.params.id, {
      $push: {transactionFractions : {fractionAmount, status}}
    }, {new: true})

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({message: 'Fraction added', data: transaction});
  } catch (error) {
    console.error("Error adding fraction in systematic: ", error.message);
    res.status(500).json({ error: `Error adding fraction in systematic: ${error.message}` });
  }
}

const addPurchRedempFractions = async (req, res) => {
  let {fractionAmount, status} = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await PurchRedemp.findByIdAndUpdate(req.params.id, {
      $push: {transactionFractions : {fractionAmount, status}}
    }, {new: true})

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({message: 'Fraction added', data: transaction});
  } catch (error) {
    console.error("Error adding fraction in purhase/redemption: ", error.message);
    res.status(500).json({ error: `Error adding fraction in purhase/redemption: ${error.message}` });
  }
}

const addSwitchFractions = async (req, res) => {
  let {fractionAmount, status} = req.body;
  fractionAmount = Number(fractionAmount)

  try {
    // Ensure the new fraction is provided
    if (!fractionAmount) {
      return res.status(400).json({ error: 'New fraction amount is required' });
    }

    // Update the document by pushing the new fraction to the array
    const transaction = await Switch.findByIdAndUpdate(req.params.id, {
      $push: {transactionFractions : {fractionAmount, status}}
    }, {new: true})

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({message: 'Fraction added', data: transaction});
  } catch (error) {
    console.error("Error adding fraction in switch: ", error.message);
    res.status(500).json({ error: `Error adding fraction in switch: ${error.message}` });
  }
}

module.exports = {
  getGroupedTransactions,
  getTransactionsBySession,
  addNewFraction,
  removeFraction,

  getSystematicTransactions,
  getPurchRedempTransactions,
  getSwitchTransactions,
  addSystematicFractions,
  addPurchRedempFractions,
  addSwitchFractions
}