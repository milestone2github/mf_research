exports.generateTransactionTableHTML = (transaction, flag, fractIdx) => {
  // let status = transaction.status
  let approvalStatus = transaction.approvalStatus
  let executionDate = transaction.createdAt
  let folioNumber = transaction.folioNumber
  let orderId = transaction.orderId
  let orderPlatform = transaction.orderPlatform
  let amount = transaction.amount
  let sipSwpStpDate = transaction.sipSwpStpDate
  let type = transaction.category === 'switch' ? 'Switch' : transaction.transactionType

  if (fractIdx >= 0) {
    // status = transaction.transactionFractions[fractIdx]?.status
    approvalStatus = transaction.transactionFractions[fractIdx]?.approvalStatus
    folioNumber = transaction.transactionFractions[fractIdx]?.folioNumber
    orderId = transaction.transactionFractions[fractIdx]?.orderId
    orderPlatform = transaction.transactionFractions[fractIdx]?.orderPlatform
    amount = transaction.transactionFractions[fractIdx]?.fractionAmount
    sipSwpStpDate = transaction.transactionFractions[fractIdx]?.transactionDate
  }

  const rows = `
    <tr>
      <td>1</td>
      <td>${transaction.transactionPreference}</td>
      <td>${executionDate}</td>
      <td>${type}</td>
      <td>${transaction.panNumber}</td>
      <td>${transaction.investorName}</td>
      <td>${transaction.familyHead}</td>
      <td>${transaction.rmName}</td>
      <td>${transaction.amcName}</td>
      <td>${transaction.schemeName}</td>
      <td>₹${amount?.toLocaleString()}</td>
      <td>${transaction.units}</td>
      <td>${transaction.fromScheme}</td>
      <td>${transaction.smName || "N/A"}</td>
      <td>${folioNumber}</td>
      <td>${transaction.fromSchemeOption}</td>
      <td>${transaction.schemeOption}</td>
      <td>${transaction.registrant}</td>
      <td>${transaction.transactionFor}</td>
      <td>${transaction.paymentMode}</td>
      <td>₹${transaction.firstTransactionAmount?.toLocaleString()}</td>
      <td>${sipSwpStpDate}</td>
      <td>${transaction.sipPauseMonth || "None"}</td>
      <td>${transaction.tenure || "N/A"}</td>
      <td>${approvalStatus}</td>
      <td>${orderId}</td>
      <td>${transaction.chequeNo || "N/A"}</td>
    </tr>`;

  const heading = `The following transaction has been flagged <b>${flag}</b> for review.`

  const template = `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Details</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }

    .container {
      max-width: 800px;
      overflow-x: auto;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 16px;
      color: #333333;
    }
    .header h1 b {
      font-size: 16px;
      color: #bc3333;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    table th,
    table td {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }

    table th {
      background-color: #007bff;
      color: #ffffff;
    }

    .footer {
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>${heading}</h1>
    </div>
    <table>
      <thead>
        <tr>
          <th>S. No.</th>
          <th>Transaction Date</th>
          <th>Execution Date</th>
          <th>Transaction Type</th>
          <th>PAN Number</th>
          <th>Investor Name</th>
          <th>Family Head</th>
          <th>RM Name</th>
          <th>AMC Name</th>
          <th>Scheme Name</th>
          <th>Amount</th>
          <th>Units</th>
          <th>From Scheme</th>
          <th>SM Name</th>
          <th>Folio No.</th>
          <th>From Scheme Option</th>
          <th>Scheme Option</th>
          <th>Registrant</th>
          <th>Transaction For</th>
          <th>Payment Mode</th>
          <th>First Transaction Amount</th>
          <th>SIP/SWP/STP Date</th>
          <th>SIP Pause Month</th>
          <th>Tenure of SIP</th>
          <th>Approval Status</th>
          <th>Order ID</th>
          <th>Cheque No.</th>
        </tr>
      </thead>
      <!-- Paste the HTML template here -->
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>

</html>`;
  return template;
};
