require("dotenv").config();
const axios = require("axios");
const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const session = require("express-session");
const sendToZohoSheet = require("./utils/sendToZohoSheet");
const schemeMap = require("./utils/schemeMap");
const sendEmail = require("./utils/sendEmail");
const connectiontomongo = require("./connectiontodatabase/connection");
const user = require("./models/adduserschema");
require("./models/addrolesechema")

connectiontomongo()
// Configure session middleware
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using https
      maxAge: 24 * 3600000,
    },
  })
);

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Initialize MongoDB Client
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
let db2;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db("Milestone");
    db2 = mongoClient.db("mftransactiondb");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}

// Middleware to provide db access
function dbAccess(req, res, next) {
  req.db = db;
  req.db2 = db2;
  next();
}

app.use(dbAccess); // Use the middleware

// login with zoho CRM 
// app.get("/auth/zoho", (req, res) => {
//   const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&scope=ZohoCRM.users.READ&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&access_type=offline`;
//   res.redirect(authUrl);
// });
// app.get("/auth/zoho/callback", async (req, res) => {
//   const code = req.query.code;
//   try {
//     const tokenResponse = await axios.post(
//       "https://accounts.zoho.com/oauth/v2/token",
//       null,
//       {
//         params: {
//           grant_type: "authorization_code",
//           client_id: process.env.ZOHO_CLIENT_ID,
//           client_secret: process.env.ZOHO_CLIENT_SECRET,
//           redirect_uri: process.env.ZOHO_REDIRECT_URI,
//           code: code,
//         },
//       }
//     );

//     const accessToken = tokenResponse.data.access_token;
//     const response = await axios.get(
//       "https://www.zohoapis.com/crm/v3/users?type=CurrentUser",
//       {
//         headers: {
//           Authorization: `Zoho-oauthtoken ${accessToken}`,
//         },
//       }
//     );
//     console.log('zoho profile: ', response.data.users[0].profile) //test
//     console.log('zoho role: ', response.data.users[0].role) //test
//     const userName = response.data.users[0].full_name;
//     const userEmail = response.data.users[0].email;
//     // Store user data in session
//     req.session.user = {
//       name: userName,
//       email: userEmail,
//       accessToken: accessToken, // Storing the access token might be useful for future API calls
//     };

//     res.redirect("http://localhost:3000");
//   } catch (error) {
//     console.error(
//       "Error during authentication or fetching user details",
//       error
//     );
//     res.status(500).send("Authentication failed");
//   }
// });

// Now, in your route handlers, you can access the database connection via `req.db`
// login with zoho auth 
app.get("/auth/zoho", (req, res) => {
  const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&scope=profile,email&redirect_uri=${process.env.ZOHO_REDIRECT_URI}&access_type=offline`;
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

    const checkuser = await user.findOne({ email: decode.email }).populate("role")
    if (checkuser) {
      req.session.user = {
        name: `${decode.first_name} ${decode.last_name}`,
        userdata: checkuser,
      };
      res.redirect("/");
    }
    else {
      res.redirect("/login?error=permissiondenied")
    }
  } catch (error) {
    console.error(
      "Error during authentication or fetching user details",
      error
    );
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/user/checkLoggedIn", (req, res) => {
  if (req.session && req.session.user) {
    // refresh the session expiration time by the time set during configuration  
    req.session.touch();

    // If the session exists and contains user information, the user is logged in
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    // Otherwise, the user is not logged in
    res.status(200).json({ loggedIn: false });
  }
});

app.post("/checkuser", async (req, res) => {
  try {
    console.log('from checkuser: ', req.body);
    const checkuser = await user.findOne({email:req.body.email}).populate("role")
    console.log(checkuser);
    if (checkuser) {
      req.session.user = {
        name: req.body.fullname,
        userdata: checkuser,
      };
      // res.redirect('http://localhost:3000');
      return res.status(200).json({success:true , msg:"logged in successfull" , user:{
        name: req.body.fullname,
        userdata: checkuser,
      }})
    }
    else {
      // res.redirect('http://localhost:3000/login?error=permissiondenied')
      return res.status(400).json({success:false , msg:"permission denied"})
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false, msg: "Internal server error"})
  }
})

app.get("/api/investors", async (req, res) => {
  try {
    const collection = req.db.collection("MintDb");
    const { name, pan, fh } = req.query;
    // Directly parse searchAll as a boolean
    const searchAll = req.query.searchall === 'true';

    if (!name && !pan && !fh) {
      return res.status(400).send("name or pan or fh parameter is required");
    }

    let query = {};
    const rmName = req.session.user.name;

    // Add query parameters based on the presence of 'name', 'pan', or 'fh'
    if (name) {
      query.NAME = new RegExp(name, "i");
    }
    else if (pan) {
      query.PAN = new RegExp(pan, "i");
    }
    else if (fh) {
      query["FAMILY HEAD"] = new RegExp(fh, "i");
    }

    // Add "RELATIONSHIP MANAGER" to the query if searchAll is false
    if (!searchAll) {
      query["RELATIONSHIP  MANAGER"] = rmName.toUpperCase();
    }

    const result = await collection.find(query).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching investors", error);
    res.status(500).send("Error while fetching investors");
  }
});


app.get("/api/folios", async (req, res) => {
  try {
    const iwellCode = req.query.iwell;
    var schemeNamePrefix = req.query.amcName;
    schemeNamePrefix = schemeNamePrefix.split(' ')[0].toLowerCase();
    if (!iwellCode || !schemeNamePrefix) {
      return res
        .status(400)
        .send("iwell code and scheme name prefix are required");
    }
    const collection = req.db.collection("folioMasterDb");

    // handling exceptional scheme names 
    if (schemeMap.has(schemeNamePrefix)) {
      schemeNamePrefix = schemeMap.get(schemeNamePrefix)
    }

    var query = {
      "IWELL CODE": parseInt(iwellCode),
      "SCHEME NAME": new RegExp(`^${schemeNamePrefix}`, "i")
    };
    const projection = {
      "_id": 0,
      "IWELL CODE": 1,
      "SCHEME NAME": 1,
      "FOLIO NO": 1,
      "UNITS": 1,
      "HOLDING": 1,
      "AUM": 1,
      "IFSC": 1,
      "ACCOUNT NO": 1
    };
    var result = await collection.find(query, { projection }).toArray();
    // if(!result.length){
    //   query = {
    //     "IWELL CODE": parseInt(iwellCode)
    //   };
    //   result=await collection.find(query,{projection}).toArray();
    // }
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("Folio not found");
    }
  } catch (error) {
    console.error("Error fetching folios", error);
    res.status(500).send("Error while fetching folios");
  }
});

app.get("/api/amc", async (req, res) => {
  try {
    const collection = req.db.collection("mfschemesDb"); // Assuming req.db is correctly set up to access your MongoDB
    const { keywords } = req.query; // Extracting keywords from query parameters
    if (!keywords) {
      return res.status(400).send("Keywords are required to get AMC names");
    }

    // Constructing a case-insensitive search query for aggregation
    var matchStage = {
      $match: {
        "FUND NAME": new RegExp(keywords, "i"),
      },
    };

    // Grouping results to ensure uniqueness and excluding _id from the output
    var groupStage = {
      $group: {
        _id: "$FUND NAME", // Group by "FUND NAME" to get unique names
      },
    };

    // Projecting the result to get the desired output format
    var projectStage = {
      $project: {
        "FUND NAME": "$_id",
        _id: 0,
      },
    };

    const result = await collection
      .aggregate([matchStage, groupStage, projectStage])
      .toArray();

    res.status(200).json(result); // Sending the result back as JSON
  } catch (error) {
    console.error("Error fetching AMC details", error);
    res.status(500).send("Error while fetching AMC details");
  }
});

app.post("/api/logout", (req, res) => {
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
});

app.get("/api/schemename", async (req, res) => {
  try {
    const collection = req.db.collection("mfschemesDb"); // Replace YourCollectionName with the actual name of your collection
    const { amc, keywords } = req.query; // This line extracts the AMC Code from the query parameters
    if (!amc) {
      return res.status(400).send("AMC Name is required");
    }
    if (!keywords) {
      return res.status(400).send("keywords are required");
    }
    var query = { "FUND NAME": amc, scheme_name: new RegExp(keywords, "i") };
    const result = await collection.find(query).toArray(); // Fetch documents based on the query
    res.status(200).json(result); // This line sends the query result back to the client as JSON
  } catch (error) {
    console.error("Error fetching scheme details", error);
    res.status(500).send("Error while fetching scheme details");
  }
});

// route to submit form
app.post("/api/data", async (req, res) => {
  try {
    const database = req.db2;
    let formData = req.body.formData;
    let allFormsData = []; // to post all entries at once to zoho flow
    let results = [];
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const { name, email } = req.session.user;
    // Include name and email in commonData
    formData.commonData = {
      ...formData.commonData,
      registrantName: name,
      registrantEmail: email
    };

    const field_mapping = {
      switchMfAmcName: "Switch MF AMC Name",
      switchFromScheme: "Switch From Scheme",
      switchToScheme: "Switch To Scheme",
      switchSchemeOption: "Switch Scheme Option",
      switchFolio: "Switch Folio",
      switchTransactionUnits_Amount: "Switch Transaction Units/Amount",
      switchTransactionAmount: "Switch Transaction Amount",
      switchRemarksByEntryPerson: "Switch Remarks By Entry Person",
      panNumber: "Pan Number",
      registrantName: "RM Name",
      registrantEmail: "RM Email",
      investorFirstName: "Investor First Name",
      investorLastName: "Investor Last Name",
      investorName: "Investor Name",
      familyHead: "Family Head",
      systematicTraxType: "Systematic Transaction Type",
      systematicTraxFor: "Systematic Transaction For",
      systematicSchemeName: "Systematic Scheme Name",
      systematicMfAmcName: "Systematic MF AMC Name",
      systematicSourceScheme: "Systematic Source Scheme",
      systematicSchemeOption: "Systematic Scheme Option",
      systematicFolio: "Systematic Folio",
      sip_swp_stpAmount: "SIP/SWP/STP Amount",
      tenureOfSip_swp_stp: "Tenure of SIP/SWP/STP",
      sipPauseMonths: "SIP Pause Months",
      sip_stp_swpDate: "SIP/STP/SWP Date",
      firstTransactionAmount: "First Transaction Amount",
      systematicRemarksByEntryPerson: "Systematic Remarks By Entry Person",
      purch_RedempTraxType: "Purchase/Redemption Transaction Type",
      purch_redempMfAmcName: "Purchase/Redemption MF AMC Name",
      purch_redempSchemeName: "Purchase/Redemption Scheme Name",
      purch_redempSchemeOption: "Purchase/Redemption Scheme Option",
      purch_redempFolio: "Purchase/Redemption Folio",
      purch_redempTransactionUnits_Amount:
        "Purchase/Redemption Transaction Units/Amount",
      purch_redempTransactionAmount: "Purchase/Redemption Transaction Amount",
      purch_redempRemarksByEntryPerson:
        "Purchase/Redemption Remarks By Entry Person",
      switchMfAmcName: "Switch MF AMC Name",
      switchFromScheme: "Switch From Scheme",
      switchToScheme: "Switch To Scheme",
      switchSchemeOption: "Switch Scheme Option",
      switchFolio: "Switch Folio",
      switchTransactionUnits_Amount: "Switch Transaction Units/Amount",
      switchTransactionAmount: "Switch Transaction Amount",
      switchRemarksByEntryPerson: "Switch Remarks By Entry Person",
      transactionPreference: "Transaction Preference",
      systematicPaymentMode: "Systematic Payment Mode",
      systematicChequeNumber: "Systematic Cheque Number",
    };

    if (formData.systematicData) {
      const collection = database.collection("systematic"); // Corrected collection name
      for (let i = 0; i < formData.systematicData.length; i++) {
        // combine common data and systematic data
        const combinedSystematic = Object.assign(
          {},
          formData.commonData,
          formData.systematicData[i]
        );

        // store systematic data in database
        const ressys = await collection.insertOne(combinedSystematic); // Corrected variable name
        if (ressys.acknowledged) {
          console.log("Data stored successfully in systematic");
          results.push({
            message: "Data stored successfully in systematic", // Corrected message
            formsub: i,
          });

          // add mongo's id field to systematic data
          combinedSystematic._id = ressys.insertedId.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedSystematic);

        }
      }
    }

    if (formData.purchRedempData) {
      const collection = database.collection("predemption");
      for (let i = 0; i < formData.purchRedempData.length; i++) {
        // combine common data with purchase/redemption
        const combinedRedemption = Object.assign(
          {},
          formData.commonData,
          formData.purchRedempData[i]
        );

        // store data in database
        const resp = await collection.insertOne(combinedRedemption);
        if (resp.acknowledged) {
          console.log("Data stored successfully in predemption");
          results.push({
            message: "Data stored successfully in predemption",
            formsub: i,
          });

          // add mongo's id field to purchase/redemption data
          combinedRedemption._id = resp.insertedId.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedRedemption);

        }
      }
    }

    if (formData.switchData) {
      const collection = database.collection("Switch");
      for (let i = 0; i < formData.switchData.length; i++) {
        // combine common data and switch data
        const combinedSwitch = Object.assign(
          {},
          formData.commonData,
          formData.switchData[i]
        );

        // store switch data to database
        const resswit = await collection.insertOne(combinedSwitch);
        if (resswit.acknowledged) {
          console.log("Data stored successfully in Switch");
          results.push({
            message: "Data stored successfully in Switch",
            formsub: i,
          });

          // add mongo's id field to purchase/redemption data
          combinedSwitch._id = resswit.insertedId.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedSwitch);

        }
      }
    }

    if (results.length > 0) {
      // send all form instances to zoho flow 
      sendToZohoSheet(allFormsData, 'All form instances sent to zoho sheet');

      // process data to create template 
      const mailData = allFormsData.map(object => {
        return Object.keys(object).reduce((acc, key) => {
          if (key !== "IWELLCODE" && key !== "_id" && object[key] !== "" && object[key] !== null && object[key] !== undefined) {
            const newKey = field_mapping[key] || key;
            acc[newKey] = object[key];
          }
          return acc;
        }, {});
      });

      // send email to user 
      sendEmail("MF Transactions", mailData, email);

      res.status(200).json(results);
    } else {
      res.status(400).json({ message: "No valid form data provided" });
    }
  } catch (error) {
    console.error("Error during submission of Form", error);
    res.status(500).send("Error during submission of Form");
  }
});

// wildcard route to serve react using express
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server running on http://localhost:${port}/`);
});
