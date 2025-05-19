const { connectToMilestoneDB } = require("../dbConfig/connection");
const Transactions = require("../models/Transactions");
const sendEmail = require("./sendEmail");
const xlsx = require('xlsx');
let milestoneDbConnection = connectToMilestoneDB();
const User = require("../models/User"); 
const getCandidateStatus = require("../controllers/onboardingControllers/springVerifyControllers"); 
const dispatchNdaFlow = require("./ndaWorkFlow"); 


const headers = [
  { header: 'Transaction date', key: 'transactionPreference' },
  { header: 'Execution date', key: 'createdAt' },
  { header: 'Transaction type', key: 'type' },
  { header: 'Pan number', key: 'panNumber' },
  { header: 'Investor name', key: 'investorName' },
  { header: 'Family head', key: 'familyHead' },
  { header: 'AMC name', key: 'amcName' },
  { header: 'Scheme name', key: 'schemeName' },
  { header: 'Amount', key: 'amount' },
  { header: 'Units', key: 'transactionUnits' },
  { header: 'From scheme', key: 'fromSchemeName' },
  { header: 'SM name', key: 'serviceManager' },
  { header: 'Folio No.', key: 'folioNumber' },
  { header: 'From scheme option', key: 'fromSchemeOption' },
  { header: 'Scheme Option', key: 'schemeOption' },
  { header: 'Transaction for', key: 'transactionFor' },
  { header: 'Payment mode', key: 'paymentMode' },
  { header: 'First trx amount', key: 'firstTransactionAmount' },
  { header: 'SIP/SWP/STP date', key: 'sipSwpStpDate' },
  { header: 'SIP Pause month', key: 'sipPauseMonths' },
  { header: 'Tenure of SIP', key: 'tenure' },
  { header: 'Approval Status', key: 'approvalStatus' },
  { header: 'Cheque No.', key: 'chequeNumber' },
];

//send last month's pending transactions of each RM to them as mail
async function pendingTransactionsNotification() {
  console.log('sending pending transactions notification...');

  let startOfLastMonth = new Date()
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  startOfLastMonth.setDate(1);
  startOfLastMonth.setHours(0, 0, 0, 0);

  let startOfThisMonth = new Date()
  startOfThisMonth.setHours(0, 0, 0, 0);
  startOfThisMonth.setDate(1)

  try {
    let pipeline = [
      {
        $match: {
          transactionPreference: { $gte: startOfLastMonth, $lt: startOfThisMonth }
        }
      },
      {
        $match: {
          $or: [
            {
              hasFractions: false,
              status: 'PENDING'
            },
            {
              hasFractions: true,
              transactionFractions: { $elemMatch: { status: 'PENDING' } }
            }
          ]
        }
      },
      {
        $group: {
          _id: '$relationshipManager',
          transactions: { $push: "$$ROOT" }
        }
      }
    ];

    const data = await Transactions.aggregate(pipeline)
    // get RM data 
    const rmCollection = milestoneDbConnection.collection("RM_db");
    const rmsData = await rmCollection.find().toArray()
    // console.log(rmsData)
    // get mail ids of each RM from RM_db collection in milestone DB (case ignore name match)
    // iterate over data array and send mail to each RM with respective transactions 
    data.forEach((item, index) => {
      const rmName = item._id;
      const rm = rmsData.find((rm) => rm['RM Name'].toLowerCase() === rmName.toLowerCase())
      if (rm && rm.Email) {
        console.log(rm.Email)
        // Create an Excel sheet with transaction data

        // Prepare transaction data to match header keys exactly
        const transactionData = item.transactions.map(transaction => {
          return headers.map(header => {
            if (header.key === 'type') {
              return transaction.category === 'switch' ? 'Switch' : transaction.transactionType || '';
            }
            return transaction[header.key] || '';
          });
        });

        // Create the worksheet with the custom headers as the first row
        const worksheet = xlsx.utils.aoa_to_sheet([
          headers.map(header => header.header) // Header row with custom headers
        ]);

        // Append data rows to the worksheet starting from row 2
        xlsx.utils.sheet_add_aoa(worksheet, transactionData, { origin: 'A2' });

        // Create a new workbook and append the worksheet
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Pending Transactions');

        // Save the Excel file to a buffer
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // send the sheet through the mail
        sendEmail({
          toAddress: rm.Email,
          subject: 'Pending MF Transactions Reminder',
          body: `Hello ${rmName},\n\nPlease find attached the pending MF transactions for the last month.\n`,
          attachments: [{
            filename: 'Pending_Transactions.xlsx',
            content: excelBuffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }],
          ccAddress: 'pramod@niveshonline.com,vilakshan@niveshonline.com,ops@niveshonline.com'
        })
      }
    });

  } catch (error) {
    console.error(error)
  }
}

async function  springVerifyStatusCheck() {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const users = await User.find({
      "onboarding.backgroundCheck.status": "in_progress",
      "onboarding.backgroundCheck.initiatedAt": { $lte: fiveDaysAgo },
    });

    for (const user of users) {
      const email = user?.onboarding?.userFilledInfo?.personalDetails?.email || user.email;
      const userId = user._id.toString();

      const statusRes = await getCandidateStatus(userId, email);

      if (statusRes.status === "success") {
        const springStatus = statusRes.data?.status;

        if (springStatus === "verified" || springStatus === "failed") {
          await User.findByIdAndUpdate(userId, {
            $set: {
              "onboarding.backgroundCheck.status": springStatus,
              "onboarding.backgroundCheck.completedAt": new Date(),
            },
          });

          if (springStatus === "verified") {
            await dispatchNdaFlow(userId, user?.onboarding?.userFilledInfo?.personalDetails || {});
            console.log(`NDA dispatched for ${email}`);
          }

          console.log(`User ${email} status updated to ${springStatus}`);
        } else {
          console.log(`User ${email} still has background status: ${springStatus}`);
        }
      } else {
        console.error(`Error checking candidate status for ${email}:`, statusRes.message);
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error.message);
  }
};

module.exports = { pendingTransactionsNotification, springVerifyStatusCheck }