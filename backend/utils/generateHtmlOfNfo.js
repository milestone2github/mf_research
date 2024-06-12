function generateHtmlOfNfo(investorName, schemeName, nfoUrl) {

return `
<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            padding: 0;
            color: #333;
            background-color: #f4f4f4;
        }

        .container {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }

        h3 {
            color: #0056b3;
        }

        .items {
            padding: 2px 0;
        }

        label {
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <h3>New Fund Offer</h3>
        <p>Following are the details of the NFO
        <p>
        <div class="items"><label>Client Name: </label> <span>${investorName}</span></div>
        <div class="items"><label>Scheme Name: </label> <span>${schemeName}</span></div>
        <div class="items"><label>Link: </label> <span>${nfoUrl}</span></div>
    </div>
</body>

 `;
}

module.exports = generateHtmlOfNfo; 