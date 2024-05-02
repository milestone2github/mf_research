require("dotenv").config();
const axios = require("axios");
const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const session = require("express-session");
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(
  session({
    secret: "44174af5c5a93051fabbada3337e57973bc8f4d56f",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using https
      maxAge: 24 * 3600000,
    },
  })
);

// app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, "./src/App.js")));


// Now, in your route handlers, you can access the database connection via `req.db`
app.get("/auth/zoho", (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=1000.9MPL9C20EN14CI5SVEST0IT80E9LGU&scope=profile,email&redirect_uri=${process.env.REDIRECT_URI}&access_type=offline`;
  res.redirect(authUrl);
});

app.get("/auth/zoho/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const tokenResponse = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          redirect_uri: process.env.REDIRECT_URI,
          code: code,
        },
      }
    );
    let id_token = tokenResponse.data.id_token;
    const decode = jwt.decode(id_token);
    req.session.user = {
      name: `${decode.first_name} ${decode.last_name}`,
      email: decode.email,
    };
    // return res.json({username:decode.first_name})
    res.redirect("/");
  } catch (error) {
    console.error(
      "Error during authentication or fetching user details",
      error
    );
    res.status(500).send("Authentication failed", error);
  }
});

app.get("/api/user/checkLoggedIn", (req, res) => {
     try {
      if (req.session && req.session.user) {
  
        // refresh the session expiration time by the time set during configuration  
        req.session.touch();
  
        // If the session exists and contains user information, the user is logged in
        res.status(200).json({ loggedIn: true, user: req.session.user });
        // } else {
        //   // Otherwise, the user is not logged in
  
        //   res.status(200).json({ loggedIn: false , user:req.session.user });
        // }
      }
      else{
        res.status(200).json({ loggedIn: false });
  
      }
     } catch (error) {
      console.log(error);
      res.status(500).json({ loggedIn: false });
        
     }
   

  });

app.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error", err);
        return res.status(500).json({ message: "Could not log out." });
      }
      res.clearCookie("user");
      return res.status(200).json({msg:"user logout successfully"}); // No content to send back
    });
  } else {
    res.status(401).json({ message: "Session not found" }); // Not authenticated or session expired
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
});

app.listen(port, () => {
  console.log(`App running http://localhost/${port}`);
})