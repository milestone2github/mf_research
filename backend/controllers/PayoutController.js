const axios = require("axios");
const sendEmail = require("../utils/sendEmail");

const INSURANCE_PAYOUT_DATA_URL = process.env.INSURANCE_PAYOUT_DATA_URL;
const INSURANCE_EARLY_PAYOUT_URL = process.env.INSURANCE_EARLY_PAYOUT_URL;
const UPDATE_INSURANCE_PAYOUT_URL = process.env.UPDATE_INSURANCE_PAYOUT_URL;

const getInsurancePayoutData = async (req, res) => {
  try {
    const mode = req.query.mode || 'dir';
    if (mode !== 'dir' && mode !== 'ass') {
      return res.status(400).json({ error: "Invalid mode parameter" });
    }

    const { data } = await axios.get(
      `${INSURANCE_PAYOUT_DATA_URL}&mode=${mode}`
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching insurance payout data:", error.message);
    res.status(500).json({ error: "Failed to fetch insurance payout data" });
  }
};


const requestEarlyRelease = async (req, res) => {
  try {
    const {
      id,
      leadID,
      leadName,
      associateName,
      associatePayout,
      insuranceType,
      mergedReferralFee,
      referralAmount,
      payoutReleaseDate,
    } = req.body;

    if (!id || !leadID || !leadName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Base Azure function URL (keep the code in env variables, not hardcoded)
    const baseUrl = INSURANCE_EARLY_PAYOUT_URL;

    // Construct query params
    const queryParams = new URLSearchParams({
      id,
      Lead_Name: leadName,
      Associate_Name: associateName,
      Associate_Payout: mergedReferralFee,
      Associate_Payout1: referralAmount,
    }).toString();

    const approveLink = `${baseUrl}&${queryParams}`;

    // Email data
    const emailData = {
      from: "insuranceearlypayout@mnivesh.niveshonline.com",
      subject: "Request for Early Payout Release",
      body: `
        <p>Dear Sir/Madam,</p>
        <p>I am requesting an early release of payout for the following record:</p>
        <p>Lead Name: ${leadName}</p>
        <p>Lead ID: ${leadID}</p>
        <p>Insurance Type: ${insuranceType}</p>
        <p>Associate Payout: ${associatePayout}%</p>
        <p>Associate Payout1: ₹ ${referralAmount}</p>
        <p>Payout Release Date: ${payoutReleaseDate}</p>
        <p><a href="${approveLink}">Approve Early Payout</a></p>
        <p>Please process the payout at your earliest convenience.</p>
        <p>Regards,<br/>Milestone Team</p>
      `,
      toAddress: "insurancemgmt@niveshonline.com",
    };

    // Send email using your mail API
    // send email to user 
    const mailMessageId = await sendEmail(emailData);

    if (!mailMessageId) {
      return res.status(response.status).json({ error: "Failed to send email" });
    }

    res.status(200).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error("Error in requestEarlyRelease:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || "Failed to send request",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};


const updateInsurancePayoutAccounts = async (req, res) => {
  try {
    // Extract IDs from request body (coming from frontend)
    const { record_ids } = req.body;

    if (!record_ids || !Array.isArray(record_ids) || record_ids.length === 0) {
      return res.status(400).json({ error: "record_ids must be a non-empty array" });
    }

    const response = await axios.post(
      UPDATE_INSURANCE_PAYOUT_URL,
      { record_ids },
      { headers: { "Content-Type": "application/json" } }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error updating insurance payout accounts:", error.message);

    if (error.response) {
      // Error response from upstream API
      return res.status(error.response.status).json({
        error: "Failed to release payout",
        details: error.response.data,
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
    getInsurancePayoutData,
    requestEarlyRelease,
    updateInsurancePayoutAccounts
};