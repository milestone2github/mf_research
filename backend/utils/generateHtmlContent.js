function generateHtmlContent(dataArray) {
  let htmlContent = dataArray.map((data, index) => {
    let listItems = Object.entries(data)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          value = value.join(", ");
        }
        return `<li><span class="label">${key}:</span> ${value}</li>`;
      })
      .join("");

    return `
          <div class="container">
              <h1>Mutual Fund Transaction ${index + 1}</h1>
              <ul>${listItems}</ul>
          </div>
      `;
  }).join("");

  return `
      <html>
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
              h1 {
                  color: #0056b3;
              }
              ul {
                  list-style: none;
                  padding: 0;
              }
              li {
                  padding: 5px 0;
              }
              .label {
                  font-weight: bold;
              }
          </style>
      </head>
      <body>
          ${htmlContent}
      </body>
      </html>
  `;
}

module.exports = generateHtmlContent;