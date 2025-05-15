// Fetch the Zoho access_token based on refresh_token
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

  module.exports = { refreshZohoAccessToken };