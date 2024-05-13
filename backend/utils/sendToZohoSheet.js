require('dotenv').config();
const axios = require('axios');

function sendToZohoSheet(data, successMsg) {
  // send data to zoho sheet 
  axios({
    method: 'post',
    url: process.env.ZOHO_SHEET_URL,
    data: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    console.log(successMsg)
  }).catch(error => {
    console.log('zoho request error: ', error)
  })
}

module.exports = sendToZohoSheet;