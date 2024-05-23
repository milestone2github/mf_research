const sendEmail = require("../utils/sendEmail");
const Systematic = require('../models/Systematic')
const PurchRedemp = require('../models/PurchRedemp')
const Switch = require('../models/Switch')
const transactionFieldsMap = require('../utils/transFieldMap');
const schemeMap = require("../utils/schemeMap");
const sendToZohoSheet = require("../utils/sendToZohoSheet");


const getInvestors = async (req, res) => {
  try {
    const collection = req.milestoneDb.collection("MintDb");
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
}

const getAmcNames = async (req, res) => {
  try {
    const collection = req.milestoneDb.collection("mfschemesDb"); // Assuming req.db is correctly set up to access your MongoDB
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
}

const getFolios = async (req, res) => {
  try {
    const iwellCode = req.query.iwell;
    var schemeNamePrefix = req.query.amcName;
    schemeNamePrefix = schemeNamePrefix.split(' ')[0].toLowerCase();
    if (!iwellCode || !schemeNamePrefix) {
      return res
        .status(400)
        .send("iwell code and scheme name prefix are required");
    }
    const collection = req.milestoneDb.collection("folioMasterDb");

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
   
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("Folio not found");
    }
  } catch (error) {
    console.error("Error fetching folios", error);
    res.status(500).send("Error while fetching folios");
  }
}

const getSchemeNames = async (req, res) => {
  try {
    const collection = req.milestoneDb.collection("mfschemesDb"); // Replace YourCollectionName with the actual name of your collection
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
}

const postTransForm = async (req, res) => {
  try {
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

    if (formData.systematicData) {
      for (let i = 0; i < formData.systematicData.length; i++) {
        // combine common data and systematic data
        const combinedSystematic = Object.assign(
          {},
          formData.commonData,
          formData.systematicData[i]
        );

        // store systematic data in database
        const ressys = await Systematic.create(combinedSystematic); // Corrected variable name
        if (ressys) {
          console.log("Data stored successfully in systematic");
          results.push({
            message: "Data stored successfully in systematic", // Corrected message
            formsub: i,
          });

          // add mongo's id field to systematic data
          combinedSystematic._id = ressys._id.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedSystematic);

        }
      }
    }

    if (formData.purchRedempData) {
      for (let i = 0; i < formData.purchRedempData.length; i++) {
        const combinedRedemption = Object.assign(
          {},
          formData.commonData,
          formData.purchRedempData[i]
        );

        // store data in database
        const resp = await PurchRedemp.create(combinedRedemption);
        if (resp) {
          console.log("Data stored successfully in predemption");
          results.push({
            message: "Data stored successfully in predemption",
            formsub: i,
          });

          // add mongo's id field to purchase/redemption data
          combinedRedemption._id = resp._id.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedRedemption);

        }
      }
    }

    if (formData.switchData) {
      for (let i = 0; i < formData.switchData.length; i++) {
        // combine common data and switch data
        const combinedSwitch = Object.assign(
          {},
          formData.commonData,
          formData.switchData[i]
        );

        // store switch data to database
        const resswit = await Switch.create(combinedSwitch);
        if (resswit) {
          console.log("Data stored successfully in Switch");
          results.push({
            message: "Data stored successfully in Switch",
            formsub: i,
          });

          // add mongo's id field to purchase/redemption data
          combinedSwitch._id = resswit._id.toString();

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
            const newKey = transactionFieldsMap[key] || key;
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
}

module.exports = { getInvestors, getAmcNames, getFolios, getSchemeNames, postTransForm }

