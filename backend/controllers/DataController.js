const sendEmail = require("../utils/sendEmail");
const transactionFieldsMap = require('../utils/transFieldMap');
const schemeMap = require("../utils/schemeMap");
const sendToZohoSheet = require("../utils/sendToZohoSheet");
const { default: axios } = require("axios");
const NewFundOffer = require("../models/NewFundOffer");
const generateHtmlContent = require("../utils/generateHtmlContent");
const generateHtmlOfNfo = require("../utils/generateHtmlOfNfo");
const Transactions = require("../models/Transactions");
const { formatDateToDDMMYYYYHHMMSSss } = require("../utils/formatDate");
require('dotenv').config()


const getKycStatus = async (req, res) => {
  try {
    const { Pan, detailCheck, detailedOutput } = req.body;
    if (!Pan) {
      return res.status(400).json({ error: "PAN is required" });
    }

    const response = await axios.post(process.env.KYC_STATUS_API_URL, {
      Pan,
      detailCheck,
      detailedOutput
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    // if (response.status !== 200) {
    //   return res.status(response.status).json({ error: "Error fetching KYC status" });
    // }

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error while getting KYC status", error.message);
    res.status(200).json({ "Status": "KYC Rejected" });
  }
};
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
    // const rmName = req.session.user.name;

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
      query["RELATIONSHIP  MANAGER"] = req.session.user.name.toUpperCase();
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

    // modify transaction preference from string to Date 
    const { transactionPreference } = formData.commonData;
    if (transactionPreference === 'ASAP') {
      formData.commonData.transactionPreference = new Date()
    }
    else if (transactionPreference === 'Next Working Day') {
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      formData.commonData.transactionPreference = tomorrow
    }

    let results = [];
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "User not logged in" });
    }
    const { name, email } = req.session.user;

    // create unique session id 
    let date = Date.now();
    let randomDigits = Math.floor(Math.random() * 9000 + 1000);
    let sessionId = date.toString() + email.slice(0, 3).toUpperCase() + randomDigits.toString()

    // Include name, email and sessionId in commonData
    formData.commonData = {
      ...formData.commonData,
      registrantName: name,
      registrantEmail: email,
      sessionId
    };

    const { systematicData, purchRedempData, switchData } = formData

    if (systematicData?.length) {
      for (const element of systematicData) {
        // combine common data and systematic data
        const combinedSystematic = {
          ...formData.commonData,
          category: 'systematic',
          transactionType: element.systematicTraxType,
          transactionFor: element.systematicTraxFor,
          amcName: element.systematicMfAmcName,
          schemeName: element.systematicSchemeName || element.systematicSourceScheme,
          folioNumber: element.systematicFolio,
          amount: element.sip_swp_stpAmount,
          paymentMode: element.systematicPaymentMode,
          schemeOption: element.systematicSchemeOption,
          firstTransactionAmount: element.firstTransactionAmount,
          sipSwpStpDate: element.sip_stp_swpDate,
          sipPauseMonths: element.sipPauseMonths,
          tenure: element.tenureOfSip_swp_stp,
          chequeNumber: element.systematicChequeNumber,
          status: 'PENDING',
        }

        // store systematic data in database
        const ressys = await Transactions.create(combinedSystematic); // Corrected variable name
        if (ressys) {
          console.log("Data stored successfully in systematic");
          results.push("Data stored successfully in systematic");

          // add mongo's id field to systematic data
          combinedSystematic._id = ressys._id.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedSystematic);

        }
      };
    }


    if (purchRedempData?.length) {
      for (const element of purchRedempData) {

        const combinedRedemption = {
          ...formData.commonData,
          category: 'purchredemp',
          transactionType: element.purch_RedempTraxType,
          amcName: element.purch_redempMfAmcName,
          schemeName: element.purch_redempSchemeName,
          folioNumber: element.purch_redempFolio,
          amount: element.purch_redempTransactionAmount,
          paymentMode: element.purch_redempPaymentMode,
          schemeOption: element.purch_redempSchemeOption,
          transactionUnits: element.purch_redempTransactionUnits_Amount,
          chequeNumber: element.purchaseChequeNumber,
          status: 'PENDING',
        }

        // store data in database
        const resp = await Transactions.create(combinedRedemption);
        if (resp) {
          console.log("Data stored successfully in predemption");
          results.push("Data stored successfully in predemption");

          // add mongo's id field to purchase/redemption data
          combinedRedemption._id = resp._id.toString();

          // push this entry to allForm data array 
          allFormsData.push(combinedRedemption);

        }
      }
    }

    if (switchData?.length) {
      for (const element of switchData) {
        // combine common data and switch data
        const combinedSwitch = {
          ...formData.commonData,
          category: 'switch',
          amcName: element.switchMfAmcName,
          schemeName: element.switchToScheme,
          fromSchemeName: element.switchFromScheme,
          folioNumber: element.switchFolio,
          transactionUnits: element.switchTransactionUnits_Amount,
          amount: element.switchTransactionAmount,
          schemeOption: element.switchToSchemeOption,
          fromSchemeOption: element.switchFromSchemeOption,
          status: 'PENDING',
        }

        // store switch data to database 
        const resswit = await Transactions.create(combinedSwitch);
        if (resswit) {
          console.log("Data stored successfully in Switch");
          results.push("Data stored successfully in Switch");

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
      sendEmail("MF Transactions", generateHtmlContent(mailData), email); //test include cc address

      res.status(200).json(results);
    } else {
      res.status(400).json({ message: "No valid form data provided" });
    }
  } catch (error) {
    console.error("Error during submission of Form", error);
    res.status(500).send("Error during submission of Form");
  }
}

const getFoliosFromFolios = async (req, res) => {
  try {
    const { folio, firstHolder, joint1, joint2, pan } = req.query;

    const collection = req.milestoneDb.collection("folioMasterDb");

    let matchStage = {};

    if (folio) {
      matchStage["cleanedFolioNo"] = { $in: Array.isArray(folio) ? folio : [folio] };
    }
    if (firstHolder) {
      matchStage["NAME AS IN FOLIO"] = firstHolder;
    }
    if (pan) {
      matchStage["PAN AS IN FOLIO"] = pan;
    }
    if (joint1) {
      matchStage["JOINT1 NAME"] = joint1;
    }
    if (joint2) {
      matchStage["JOINT2 NAME"] = joint2;
    }

    const result = await collection.aggregate([
      {
        $addFields: {
          "cleanedFolioNo": {
            $cond: {
              if: { $eq: [{ $substrCP: ["$FOLIO NO", 0, 1] }, "'"] },
              then: { $substrCP: ["$FOLIO NO", 1, { $strLenCP: "$FOLIO NO" }] },
              else: "$FOLIO NO"
            }
          }
        }
      },
      {
        $match: matchStage
      },
      {
        $group: {
          "_id": "$cleanedFolioNo",
          "name": { $first: "$NAME AS IN FOLIO" },
          "joint1Name": { $first: "$JOINT1 NAME" },
          "joint2Name": { $first: "$JOINT2 NAME" },
        }
      }
    ]).toArray();

    if (result.length > 0) {
      res.status(200).json({ message: "Folios found", data: result });
    } else {
      res.status(404).send("Folio not found");
    }
  } catch (error) {
    console.error("Error fetching folios", error);
    res.status(500).send("Error while fetching folios");
  }
}


const getNfoAmc = async (req, res) => {
  try {
    const bseCollection = req.milestoneDb.collection('bseschemes')

    const today = new Date();
    const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1); // First day of next of next month
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)

    const formatDateString = (date) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = String(date.getDate());
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    }

    const nextDayString = formatDateString(nextDay);
    const nextMonthString = formatDateString(nextMonth);

    // console.log('current date: ', nextDayString) //test
    // console.log('next month end date: ', nextMonthString) //test

    const data = await bseCollection.aggregate([
      {
        $match: {
          "ReOpening Date": { $exists: true, $type: "string" }
        }
      },
      {
        $addFields: {
          "ReOpeningDateCleaned": {
            $replaceAll: {
              input: "$ReOpening Date",
              find: "  ",
              replacement: " "
            }
          },
          "EndDateCleaned": {
            $replaceAll: {
              input: "$End Date",
              find: "  ",
              replacement: " "
            }
          }
        }
      },
      {
        $addFields: {
          "ReOpeningDateParsed": {
            $dateFromString: {
              dateString: "$ReOpeningDateCleaned",
              format: "%b %d %Y"
            }
          },
          "EndDateParsed": {
            $dateFromString: {
              dateString: "$EndDateCleaned",
              format: "%b %d %Y"
            }
          }
        }
      },
      {
        $match: {
          $and: [{"ReOpeningDateParsed": {
            $gt: new Date(nextDayString),
            $lt: new Date(nextMonthString)
          }}, {"EndDateParsed": {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0), 
            $lt: new Date(lastDayOfYear)}
          }]
        }
      },
      {
        $group: {
          _id: "$AMC Code",
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();

    if (!data) {
      return res.status(400).json({ message: 'Error getting NFO AMC', data: null })
    }

    const bseFundMapCollection = req.milestoneDb.collection('bseFundsMap')
    const bseFundsMap = await bseFundMapCollection.find().toArray()

    const amcs = data.map(item => {
      const hasFoundBseFund = bseFundsMap.find(bseFund => bseFund.bseName === item._id)
      return hasFoundBseFund ? hasFoundBseFund.readableName : item._id
    })

    res.status(200).json({ message: 'Found NFO AMC', data: amcs })
  } catch (error) {
    console.log('Error while getting NFO AMC', error.message)
    res.status(500).json({ error: `Error getting NFO AMC: ${error.message}` })
  }
}

// const getNfoSchemes = async (req, res) => { // accepts amc in query
//   const { amc, schemePlan, purchaseTrxMode } = req.query;
//   try {
//     const bseCollection = req.milestoneDb.collection('bseschemes')

//     const today = new Date();
//     const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
//     const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1); // First day of next of next month

//     const formatDateString = (date) => {
//       const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//       const day = String(date.getDate());
//       const month = monthNames[date.getMonth()];
//       const year = date.getFullYear();
//       return `${month} ${day} ${year}`;
//     }

//     const nextDayString = formatDateString(nextDay);
//     const nextMonthString = formatDateString(nextMonth);

//     // console.log('current date: ', nextDayString) //test
//     // console.log('next month end date: ', nextMonthString) //test
//     let matchStage = {
//       "ReOpeningDateParsed": {
//         $gt: new Date(nextDayString),
//         $lt: new Date(nextMonthString)
//       }
//     }

//     if (amc) {
//       matchStage['AMC Code'] = { $in: Array.isArray(amc) ? amc : [amc] }
//     }
//     if (schemePlan) {
//       matchStage['Scheme Plan'] = { $in: Array.isArray(schemePlan) ? schemePlan : [schemePlan] }
//     }
//     if (purchaseTrxMode) {
//       matchStage['Purchase Transaction mode'] = { $in: Array.isArray(purchaseTrxMode) ? purchaseTrxMode : [purchaseTrxMode] }
//     }

//     const data = await bseCollection.aggregate([
//       {
//         $match: {
//           "ReOpening Date": { $exists: true, $type: "string" }
//         }
//       },
//       {
//         $addFields: {
//           "ReOpeningDateCleaned": {
//             $replaceAll: {
//               input: "$ReOpening Date",
//               find: "  ",
//               replacement: " "
//             }
//           }
//         }
//       },
//       {
//         $addFields: {
//           "ReOpeningDateParsed": {
//             $dateFromString: {
//               dateString: "$ReOpeningDateCleaned",
//               format: "%b %d %Y"
//             }
//           }
//         }
//       },
//       {
//         $match: matchStage
//       },
//       { $sort: { "ReOpeningDateParsed": 1 } },
//       // {
//       //   $project: {
//       //     _id: 0,
//       //     "Scheme Name": 1,
//       //     "ReOpeningDateParsed": 1
//       //     "ISIN": 1
//       //   }
//       // }
//     ]).toArray();

//     if (!data) {
//       return res.status(400).json({ message: 'Error getting NFO schemes', data: null })
//     }

//     res.status(200).json({ message: 'Found NFO schemes', data })
//   } catch (error) {
//     console.log('Error while getting NFO schemes', error.message)
//     res.status(500).json({ error: `Error getting NFO schemes: ${error.message}` })
//   }
// }
const getNfoSchemes = async (req, res) => {
  let { amc, schemePlan, purchaseTrxMode } = req.query;
  try {
    const bseCollection = req.milestoneDb.collection('bseschemes');

    const today = new Date();
    const nextDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1); // First day of next of next month
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999)

    const formatDateString = (date) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = String(date.getDate());
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    };

    const nextDayString = formatDateString(nextDay);
    const nextMonthString = formatDateString(nextMonth);

    let matchStage = {
      $and: [{"ReOpeningDateParsed": {
        $gt: new Date(nextDayString),
        $lt: new Date(nextMonthString)
      }}, {"EndDateParsed": {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0), 
        $lt: new Date(lastDayOfYear)}
      }]
    };

    if (amc) {
      const bseFundMapCollection = req.milestoneDb.collection('bseFundsMap')
      const matchedBseName = await bseFundMapCollection.findOne({ readableName: amc })
      amc = matchedBseName?.bseName ? matchedBseName.bseName : amc
      matchStage['AMC Code'] = amc;
    }
    if (schemePlan) {
      matchStage['Scheme Plan'] = { $in: Array.isArray(schemePlan) ? schemePlan : [schemePlan] };
    }
    if (purchaseTrxMode) {
      matchStage['Purchase Transaction mode'] = { $in: Array.isArray(purchaseTrxMode) ? purchaseTrxMode : [purchaseTrxMode] };
    }

    const data = await bseCollection.aggregate([
      {
        $match: {
          "ReOpening Date": { $exists: true, $type: "string" }
        }
      },
      {
        $addFields: {
          "ReOpeningDateCleaned": {
            $replaceAll: {
              input: "$ReOpening Date",
              find: "  ",
              replacement: " "
            }
          },
          "EndDateCleaned": {
            $replaceAll: {
              input: "$End Date",
              find: "  ",
              replacement: " "
            }
          }
        }
      },
      {
        $addFields: {
          "ReOpeningDateParsed": {
            $dateFromString: {
              dateString: "$ReOpeningDateCleaned",
              format: "%b %d %Y"
            }
          },
          "EndDateParsed": {
            $dateFromString: {
              dateString: "$EndDateCleaned",
              format: "%b %d %Y"
            }
          }
        }
      },
      {
        $match: matchStage
      },
      { $sort: { "ReOpeningDateParsed": 1 } }
    ]).toArray();

    // Remove keywords from "Scheme Name"
    const keywordsToRemove = /growth|idcw|-|payout|reinvestment/gi;
    const cleanedData = data.map(item => {
      item["Scheme Name"] = item["Scheme Name"].replace(keywordsToRemove, '').trim();
      return item;
    });

    // Ensure unique schemes after removing keywords
    const uniqueSchemes = Array.from(new Set(cleanedData.map(item => item["Scheme Name"])))
      .map(schemeName => cleanedData.find(item => item["Scheme Name"] === schemeName));

    if (!uniqueSchemes) {
      return res.status(400).json({ message: 'Error getting NFO schemes', data: null });
    }

    res.status(200).json({ message: 'Found NFO schemes', data: uniqueSchemes });
  } catch (error) {
    console.log('Error while getting NFO schemes', error.message);
    res.status(500).json({ error: `Error getting NFO schemes: ${error.message}` });
  }
};

const getUcc = async (req, res) => {
  let pan = req.query.pan;
  if (!pan) {
    return res.status(400).json({ error: "PAN is required" })
  }

  try {
    const clientMasterCollection = req.milestoneDb.collection('BSEclientmaster');
    const data = await clientMasterCollection.find({
      $or: [
        { "Primary_Holder_PAN": pan },
        { "Second_Holder_PAN": pan },
        { "Third_Holder_PAN": pan }
      ]
    }).toArray();

    res.status(200).json({ message: 'UCC data found', data })
  } catch (error) {
    console.log('Error while getting UCC data', error.message)
    res.status(500).json({ error: `Error while getting UCC data: ${error.message}` })
  }
}

const postNewFundOfferForm = async (req, res) => {
  console.log('POST /api/data/nfo') //test
  const { investorName, pan, familyHead, ucc, amc, schemeCode, schemeName, folio, amount, schemeOption } = req.body;

  // create unique session id 
  let date = formatDateToDDMMYYYYHHMMSSss(new Date());
  let randomDigits = Math.floor(Math.random() * 9000 + 1000);
  let sessionId = date.toString() + randomDigits.toString()

  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User not logged in" });
  }
  const { name, email } = req.session.user;

  const nfoUrl = `https://transaction.mnivesh.com/${sessionId}`

  try {
    const nfo = await NewFundOffer.create({
      orderId: sessionId,
      investorName,
      panNumber: pan,
      familyHead,
      registrantName: name,
      registrantEmail: email,
      ucc,
      schemeOption,
      amcName: amc,
      schemeName,
      schemeCode,
      folioNumber: folio,
      amount,
      nfoUrl: `${nfoUrl}`
    });
    if (!nfo) {
      return res.status(400).json({ error: "Error saving NFO data to DB" })
    }

    let sheetData = { ...nfo.toObject(), category: 'nfo' }

    // send to zoho sheet 
    sendToZohoSheet(sheetData, 'NFO data sent to zoho sheet')

    // send email to user 
    let mailBody = generateHtmlOfNfo(nfo.investorName, schemeName, nfo.nfoUrl)
    sendEmail(`NFO | ${schemeName} | ${nfo.investorName}`, mailBody, email, 'pramod@niveshonline.com,vilakshan@niveshonline.com');
    res.status(201).json({ message: "NFO saved", data: nfo })
  } catch (error) {
    console.error("Error savig NFO :", error.message)
    res.status(500).json({ error: `Error saving NFO: ${error.message}` })
  }
}
// const getUcc = async (req, res) => {

//   try {
//     const clientMasterCollection = req.milestoneDb.collection('BSEclientmaster');
//     const data = await clientMasterCollection.aggregate([
//       {$group: {
//         "_id": "$Tax_Status"
//       }}
//     ]).toArray();

//     res.status(200).json({ message: 'UCC data found', data })
//   } catch (error) {
//     console.log('Error while getting UCC data', error.message)
//     res.status(500).json({ error: `Error while getting UCC data: ${error.message}` })
//   }
// }

const getFoliosFromInvestwell = async (req, res) => {
  let pan = req.query.pan;
  if (!pan) {
    return res.status(400).json({ error: "PAN is required" })
  }
  // console.log('pan: ', pan)//test
  // console.log('authName: ', process.env.INVESTWELL_AUTHNAME)//test
  // console.log('password: ', process.env.INVESTWELL_PASSWORD)//test

  try {
    let authResponse;
    let attempt = 2;
    while (attempt--) {
      authResponse = await axios.post("https://mnivesh.investwell.app/api/aggregator/auth/getAuthorizationToken",
        {
          "authName": process.env.INVESTWELL_AUTHNAME,
          "password": process.env.INVESTWELL_PASSWORD
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      )

      if (authResponse.data?.status === 0) {
        break;
      }
    }

    if (authResponse.data?.status === -1) {
      throw new Error("Unable to generate token")
    }
    // console.log('auth data:', authResponse.data) //test

    let date = new Date()
    let startDate = '2022-01-01'
    let endDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    // console.log('endDate: ', endDate) //test

    const filters = JSON.stringify([
      { "startDate": startDate },
      { "endDate": endDate },
      { "pan": pan },
      { "panWiseData": 1 }
    ]);

    const folioUrl = `https://mnivesh.investwell.app/api/aggregator/reports/getPortfolioSummaryForMutualFunds?groupBy=1005&filters=${encodeURIComponent(filters)}&token=${authResponse.data?.result?.token}`;

    const folioData = await axios.get(folioUrl);
    // console.log('folioData: ', folioData) //test

    if (folioData?.data?.status === -1 || folioData?.data?.message === 'User not authorized') {
      return res.status(400).json({ error: `Error while getting folios: not authorized` })
    }
    let folios = folioData.data.result.data.map(item => ({
      folioNo: item.folioNo,
      isin: item.isinNo
    }))
    // let folios = folioData.data.result.data.map(item => (item.folioNo))
    res.status(200).json({ message: 'Folios found', data: folios })
  } catch (error) {
    console.log('Error while getting folios', error.message)
    res.status(500).json({ error: `Error while getting folios: ${error.message}` })
  }
}

const getIsin = async (req, res) => { // accepts amc in query
  const { amc, schemePlan, purchaseTrxMode } = req.query;
  try {
    const bseCollection = req.milestoneDb.collection('bseschemes')

    let matchStage = {}

    if (amc) {
      matchStage['AMC Code'] = { $in: Array.isArray(amc) ? amc : [amc] }
    }
    if (schemePlan) {
      matchStage['Scheme Plan'] = { $in: Array.isArray(schemePlan) ? schemePlan : [schemePlan] }
    }
    if (purchaseTrxMode) {
      matchStage['Purchase Transaction mode'] = { $in: Array.isArray(purchaseTrxMode) ? purchaseTrxMode : [purchaseTrxMode] }
    }

    const data = await bseCollection.aggregate([
      {
        $match: matchStage
      },
      {
        $project: {
          _id: 0,
          "Scheme Name": 1,
          "ReOpeningDateParsed": 1,
          "ISIN": 1
        }
      }
    ]).toArray();

    if (!data) {
      return res.status(400).json({ message: 'Error getting ISIN', data: null })
    }

    res.status(200).json({ message: 'Found ISIN', data })
  } catch (error) {
    console.log('Error while getting ISIN', error.message)
    res.status(500).json({ error: `Error getting ISIN: ${error.message}` })
  }
}

// temporary controller to get all amcs 
const getAllNfoAmc = async (req, res) => {
  try {
    const bseCollection = req.milestoneDb.collection('bseschemes')

    const data = await bseCollection.aggregate([
      {
        $group: {
          "_id": "$AMC Code",
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    if (!data) {
      return res.status(400).json({ message: 'Error getting NFO AMC', data: null })
    }

    res.status(200).json({ message: 'Found NFO AMC', data })
  } catch (error) {
    console.log('Error while getting NFO AMC', error.message)
    res.status(500).json({ error: `Error getting NFO AMC: ${error.message}` })
  }
}

const addNfoSchemeToSchemes = async (req, res) => {
  const { amcName, schemeName } = req.query
  try {
    const collection = req.milestoneDb.collection("mfschemesDb")
    const doc = await collection.insertOne({ "FUND NAME": amcName, "scheme_name": schemeName })
    if (!doc) {
      throw new Error("Unable to add scheme")
    }
    res.status(201).json({ message: 'Scheme added', data: doc })
  } catch (error) {
    console.log("Error adding scheme: ", error.message)
    res.status(500).json({ error: `Error adding scheme: ${error.message}` })
  }
}

module.exports = {
  getInvestors,
  getAmcNames,
  getFolios,
  getSchemeNames,
  postTransForm,
  getNfoSchemes,
  getUcc,
  getFoliosFromInvestwell,
  getNfoAmc,
  postNewFundOfferForm,
  getFoliosFromFolios,
  getIsin,
  getAllNfoAmc,
  getKycStatus,
  addNfoSchemeToSchemes
}

