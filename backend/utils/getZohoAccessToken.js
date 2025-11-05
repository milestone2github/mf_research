const axios = require("axios");

const NDA_ZOHO_REFRESH_TOKEN = process.env.NDA_ZOHO_REFRESH_TOKEN;
const NDA_ZOHO_CLIENT_ID = process.env.NDA_ZOHO_CLIENT_ID;
const NDA_ZOHO_CLIENT_SECRET = process.env.NDA_ZOHO_CLIENT_SECRET;

async function getZohoAccessToken() {
  // console.log("Entered the getZohoAccessToken Function");
  
  const TOKEN_ENDPOINT = "https://accounts.zoho.in/oauth/v2/token";
  const payload = new URLSearchParams({
    refresh_token: NDA_ZOHO_REFRESH_TOKEN,
    client_id: NDA_ZOHO_CLIENT_ID,
    client_secret: NDA_ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token"
  });

  try {
    const response = await axios.post(TOKEN_ENDPOINT, payload);
    // console.log("Exit getZohoAccessToken Acces Token is ",response.data.access_token);
    
    return response.data.access_token;
  } catch (err) {
    console.error("Failed to fetch Zoho access token:", err.response?.data || err.message);
    throw new Error("Token generation failed");
  }
}

module.exports = { getZohoAccessToken };