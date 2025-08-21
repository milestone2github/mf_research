const axios = require("axios");

const WEB_HOOK_ZOHO_CLIENT_ID = process.env.WEB_HOOK_ZOHO_CLIENT_ID;
const WEB_HOOK_ZOHO_CLIENT_SECRET = process.env.WEB_HOOK_ZOHO_CLIENT_SECRET;
const WEB_HOOK_ZOHO_REFRESH_TOKEN = process.env.WEB_HOOK_ZOHO_REFRESH_TOKEN;

// althought the getwebHookAccessToken also full involves Zoho to get Acces token
async function getwebHookAccessToken() {
  // console.log("Entered the getwebHookAccessToken Function");
  
  const TOKEN_ENDPOINT = "https://accounts.zoho.com/oauth/v2/token";
  const payload = new URLSearchParams({
    refresh_token: WEB_HOOK_ZOHO_REFRESH_TOKEN,
    client_id: WEB_HOOK_ZOHO_CLIENT_ID,
    client_secret: WEB_HOOK_ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token"
  });

  try {
    const response = await axios.post(TOKEN_ENDPOINT, payload);
    // console.log("Exit getwebHookAccessToken Acces Token is ",response.data.access_token);
    
    return response.data.access_token;
  } catch (err) {
    console.error("Failed to fetch Zoho access token:", err.response?.data || err.message);
    throw new Error("Token generation failed");
  }
}

module.exports = { getwebHookAccessToken };