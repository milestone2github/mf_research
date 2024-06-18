const PurchRedemp = require("../models/PurchRedemp");
const Switch = require("../models/Switch");
const Systematic = require("../models/Systematic")

const getGroupedTransactions = async (req, res) => {
  try {
    // const systematicTransactions = await Systematic.findOneAndUpdate({sessionId: '1718177502407kis7907'}, {status: 'PENDING'}, {new: true})
    // get all systematic transactions group by "sessionId" 
    const pipeline = (pendingFieldName) => [
      {
        $sort: { transactionPreference: 1 },
      },
      { $group: {
        "_id": '$sessionId',
        count: {$sum : 1 },
        investorName: {$first: "$investorName"},
        familyHead: {$first: "$familyHead"},
        createdAt: {$first: "$createdAt"},
        [pendingFieldName]: {$sum: {
          $cond : [{$eq: ["$status", 'PENDING']}, 1, 0]
        }}
      }}
    ];

    const systematicTransactions = await Systematic.aggregate(pipeline('sysPending'))

    // get all purchredemp transactions group by "sessionId" 
    const purchRedempTransactions = await PurchRedemp.aggregate(pipeline('purchRedempPending'))

    // get all switch transactions group by "sessionId" 
    const switchTransactions = await Switch.aggregate(pipeline('switchPending'))

    // Combine all transactions into one array
    const combinedTransactions = [
      ...systematicTransactions,
      ...purchRedempTransactions,
      ...switchTransactions,
    ];

    // Group the combined transactions by sessionId
    const groupedTransactions = combinedTransactions.reduce((acc, transaction) => {
      const sessionId = transaction._id;
      if (!acc[sessionId]) {
        acc[sessionId] = {
          _id: sessionId,
          count: 0,
          investorName: transaction.investorName,
          familyHead: transaction.familyHead,
          createdAt: transaction.createdAt,
          sysPending: 0,
          purchRedempPending: 0,
          switchPending: 0,
        };
      }
      acc[sessionId].count += transaction.count;
      if (transaction.sysPending !== undefined) {
        acc[sessionId].sysPending += transaction.sysPending;
      }
      if (transaction.purchRedempPending !== undefined) {
        acc[sessionId].purchRedempPending += transaction.purchRedempPending;
      }
      if (transaction.switchPending !== undefined) {
        acc[sessionId].switchPending += transaction.switchPending;
      }
      return acc;
    }, {});

    // Convert the grouped transactions object to an array
    const result = Object.values(groupedTransactions);
    const sortedResult = result.sort((a, b) => a.createdAt - b.createdAt);

    res.status(200).json({
      message: 'found grouped transactions', 
      data: sortedResult
    })
  } catch (error) {
    console.log('Error finding grouped transactions', error.message)
    res.status(500).json({error: `Error finding grouped transactions, ${error.message}`})
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
  getSystematicTransactions,
  getPurchRedempTransactions,
  getSwitchTransactions,
  addSystematicFractions,
  addPurchRedempFractions,
  addSwitchFractions
}