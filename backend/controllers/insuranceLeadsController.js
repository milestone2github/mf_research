// backend/routes/insuranceLeads.js
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const InsuranceRecoFile = require("../models/InsuranceRecoFile");
const sendEmail = require("../utils/sendEmail");

async function ingestInsuranceLeads(req, res) {
  try {
    const { company, fileType, reupload } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "file is required" });
    }

    const baseUrl = process.env.INSURANCE_LEADS_API_URL;
    if (!baseUrl) {
      return res
        .status(500)
        .json({ message: "INSURANCE_LEADS_API_URL not set" });
    }
    console.log("File name:", file.originalname);

    
    // Build URL with query params safely
    const url = new URL(baseUrl);
    url.searchParams.set("company", company);
    url.searchParams.set("type", fileType);
    url.searchParams.set("reupload", reupload === "true");
    const targetUrl = url.toString();
    
    console.log("[insurance-leads] Forwarding to:", targetUrl);
    

    // Build multipart form-data
    const form = new FormData();
    form.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // No timeout → let request run until upstream responds
    const response = await axios.post(targetUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    return res.status(200).json({
      ok: true,
      upstreamStatus: response.status,
      upstreamData: response.data,
    });
  } catch (err) {
    const status = err?.response?.status || 502;
    const data = err?.response?.data || err.message;
    const fileName = req.file?.originalname || "N/A";
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    console.error("[insurance-leads] Forward error status:", status);
    console.error("[insurance-leads] Forward error data:", data);

    //  Send email notification 
    try {
      await sendEmail({
        toAddress: "abhishek@niveshonline.com",
        subject: `Insurance Lead Upload Failed (HTTP ${status})`,
        body: `
          <h2>Insurance Lead Upload Failed</h2>
          <p><b>Timestamp:</b> ${timestamp}</p>
          <p><b>Company:</b> ${req.body?.company}</p>
          <p><b>File Type:</b> ${req.body?.fileType}</p>
          <p><b>Reupload:</b> ${req.body?.reupload}</p>
          <p><b>File Name:</b> ${fileName}</p>
          <p><b>Status Code:</b> ${status}</p>
          <p><b>Error Message:</b> ${err.message}</p>
          <p><b>Details:</b></p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        `,
      });
    } catch (emailErr) {
      console.error(" Failed to send error email:", emailErr.message);
    }

    // Return clean error to frontend
    return res.status(status).json({ message: "failed to upload the file", detail: data });
  }
}

// ---------------- New companies route ----------------
async function getInsuranceCompanies(req, res) {
  try {
    // find or create single doc
    let doc = await InsuranceRecoFile.findOne();
    if (!doc) {
      doc = await InsuranceRecoFile.create({ filenames: [] });
    }

    res.json(doc.filenames);
  } catch (err) {
    console.error("[insurance-leads] companies error:", err);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
}

module.exports = {ingestInsuranceLeads, getInsuranceCompanies};
