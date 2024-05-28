require('dotenv').config();
const { default: axios } = require('axios');
const User = require('../models/User');
require('../models/Role');
const jwt = require('jsonwebtoken');

const loginWithZoho = (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&scope=profile,email&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&access_type=offline`;
  res.redirect(authUrl);
}

const zohoCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          redirect_uri: process.env.ZOHO_REDIRECT_URI,
          code: code,
        },
      }
    );

    let id_token = tokenResponse.data.id_token;
    const decode = jwt.decode(id_token);
    // Store user data in session

    const userExist = await User.findOne({ email: decode.email }).populate("role")

    if (userExist) {
      req.session.user = {
        name: `${decode.first_name} ${decode.last_name}`,
        email: userExist.email,
        role: userExist.role
      };
      res.redirect(process.env.FRONTEND_URL ?`${process.env.FRONTEND_URL}/` : '/');
    }
    else {
      res.redirect(process.env.FRONTEND_URL ?`${process.env.FRONTEND_URL}/login?error=permissiondenied` :`/login?error=permissiondenied`)
    }
  } catch (error) {
    console.error(
      "Error during authentication or fetching user details",
      error
    );
    res.status(500).send("Authentication failed");
  }
}

const logout = (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error", err);
          return res.status(500).json({ message: "Could not log out." });
        }
        res.clearCookie("user");
        res.status(204).send(); // No content to send back
      });
    } else {
      res.status(401).json({ message: "Session not found" }); // Not authenticated or session expired
    }
  };

const verifySession = (req, res) => {
  if (req.session && req.session.user) {
    // refresh the session expiration time by the time set during configuration  
    req.session.touch();

    // If the session exists and contains user information, the user is logged in
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    // Otherwise, the user is not logged in
    res.status(200).json({ loggedIn: false, user: null });
  }
}

const verifyGoogleUser = async (req, res) => {
  try {
    const userExist = await User.findOne({email:req.body.email}).populate("role")

    if (userExist) {
      req.session.user = {
        name: req.body.fullname,
        email: userExist.email,
        role: userExist.role
      };

      return res.status(200).json({success:true , msg:"logged in successfull" , user:{
        name: req.body.fullname,
        userdata: userExist,
      }})
    }
    else {

      return res.status(400).json({success:false , msg:"permission denied"})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, msg: "Internal server error"})
  }
}

module.exports = { loginWithZoho, zohoCallback, verifySession, verifyGoogleUser, logout }