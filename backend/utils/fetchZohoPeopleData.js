const axios = require('axios');

// Function to fetch data from Zoho People using the specified URL and access token
const fetchZohoPeopleData = async (url, token) => {
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Zoho-oauthtoken ${token}` }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

module.exports = { fetchZohoPeopleData };