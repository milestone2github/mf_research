const axios = require("axios");

const refreshZohoAccessToken = async (refreshToken) => {
    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "refresh_token",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          refresh_token: refreshToken,
        },
      }
    );
  
    return response.data.access_token;
  };


async function getZohoAccessToken() {
 let access_token = req.session.user?.access_token;
    const refresh_token = req.session.user?.refresh_token;

    if (!access_token && !refresh_token) {
      return res.status(401).json({ message: "No Access Token & Refresh Token found" });
    }
    
    if (!access_token && refresh_token) {
      access_token = await refreshZohoAccessToken(refresh_token);
      req.session.user.access_token = access_token;
    }

    return access_token;
}

module.exports = { getZohoAccessToken };