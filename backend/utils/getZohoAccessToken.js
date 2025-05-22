const axios = require("axios");

const ZOHO_REFRESH_TOKEN = "1000.307794b3c011921e299b4d0acd359eb5.88738d4c43f9d4e9366cc6217bbb30b3";
const ZOHO_CLIENT_ID = "1000.G3968UN5TA824EHUKDLJF4G3AAXRYE";
const ZOHO_CLIENT_SECRET = "504c9843972f6256013334cec909fb6305d52ad5f8";

async function getZohoAccessToken() {
  const TOKEN_ENDPOINT = "https://accounts.zoho.in/oauth/v2/token";
  const payload = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token"
  });

  try {
    const response = await axios.post(TOKEN_ENDPOINT, payload);
    console.log(response.data.access_token);
    
    return response.data.access_token;
  } catch (err) {
    console.error("Failed to fetch Zoho access token:", err.response?.data || err.message);
    throw new Error("Token generation failed");
  }
}

module.exports = { getZohoAccessToken };