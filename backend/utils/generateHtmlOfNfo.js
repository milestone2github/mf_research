function generateHtmlOfNfo({investorName, schemeName, nfoUrl, pan, ucc, amount, folio}) {

return `
<!DOCTYPE html>
<html lang="en">

<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: "Roboto", sans-serif;
      margin: 20px;
      padding: 0;
      color: #333;
      background-color: #f4f4f4;
    }

    .container {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 16px;
      padding: 24px;
      margin: 15px 0;
    }

    h3 {
      color: #C08552;
      font-size: 1.5rem;
      margin: 4px 0;
      margin-bottom: 24px;
    }

    .items {
      padding: 2px 0;
    }
    .items span {
      color: #52606d;
      font-weight: bold;
      font-size: 0.9rem;
    }
    .group {
      padding: 16px;
      background: #f2f4f8;
      border-radius: 16px;
    }
    .group:last-child{
      margin-top: 8px;
    }
    h4 {
      margin: 6px 0;
      font-size: 0.8rem;
      color: #52606d;
    }

    label {
      color: #52606d;
    }
  </style>
</head>

<body>
  <div class="container">
    <h3>New Fund Offer</h3>
    <p style="margin-bottom: 8px;">Following are the details of the NFO</p>
    <div class="group">
      <h4>Client Details:</h4>
      <div class="items"><label>Client Name: </label> <span>${investorName}</span></div>
      <div class="items"><label>PAN Number: </label> <span>${pan}</span></div>
      <div class="items"><label>UCC: </label> <span>${ucc}</span></div>
    </div>
    <div class="group">
      <h4>Scheme Details:</h4>
      <div class="items"><label>Scheme Name: </label> <span>${schemeName}</span></div>
      <div class="items"><label>Amount: </label> <span>${amount}</span></div>
      <div class="items"><label>Folio No.: </label> <span>${folio}</span></div>
      <div class="items"><label>Link: </label> <span>${nfoUrl}</span></div>
    </div>
  </div>
</body>

</html>

 `;
}

module.exports = generateHtmlOfNfo; 