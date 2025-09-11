const User = require("../../models/User");
const axios = require("axios");
const Department = require("../../models/Department");
const Role = require("../../models/Role");
const { fetchPackageAndAddCandidate, getCandidateStatus } = require('./springVerifyControllers');
const { getZohoAccessToken } = require("../../utils/getZohoAccessToken");
const { getwebHookAccessToken } = require("../../utils/webHookAccessToken");
const { getNewJoineeMailBody } = require("../../utils/newJoineeMailTemplate");
const sendEmail = require("../../utils/sendEmail");
const generateOnboardingLink = require('../../utils/generateOnboardingLink');
const { getOfferLetterEmailTemplate } = require('../../utils/offerLetterTemplate');
const { BlobServiceClient } = require('@azure/storage-blob');
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const ONBOARDING_FORM_LINK = process.env.ONBOARDING_FORM_LINK;
const WRITER_DOCUMENT_ID = process.env.WRITER_DOCUMENT_ID; 
const FormData = require("form-data");
const mongoose = require('mongoose');
require("dotenv").config();

// Sending Gotra to new employees Via Mail
async function sendGotraDocument(user) {
  try {

    // 1. Fetch the PDF from blob storage
    const gotraUrl =
      "https://mfdatafeed.blob.core.windows.net/onboarding/Gotraka_-_HR_guideline_2023_.pdf";
    const response = await axios.get(gotraUrl, { responseType: "arraybuffer" });
    const pdfBuffer = Buffer.from(response.data, "binary");

    // 2. Send email
    const to = user.email;
    const name = user.onboarding.hrFilledInfo.name;

    const mailResult = await sendEmail({
      toAddress: to,
      subject: 'Milestone Gotra Guidelines',
      body: `
       Your Gotra Guideline Document,
      <p>Dear ${name},</p>
      <p>Please find attached the Gotra guideline document for your reference.</p>
      <p>Regards,<br/>HR Team</p>`,
      attachments: { "Gotra_Guideline.pdf": pdfBuffer }
    }
    );

    if (mailResult) {
      // 4. Update and save
      user.onboarding.gotra.sent = true;
      user.onboarding.gotra.sentAt = new Date();
      await user.save();
    }

    return true;

  } catch (error) {
    console.error("❌ Failed to send Gotra document:", error.message);
    throw new Error("Gotra document email dispatch failed");
  }
}

// Sent new Joinee notification Mail to all Employees
async function sentNewJoineeMailNotification(user) {
  try {
    const accessToken = await getwebHookAccessToken();

    const allEmployeeMailIds = await getEmployeeRecords(accessToken);

    // const allEmployeeMailIds = ['mayank@niveshonline.com', 'kishan@niveshonline.com'];

    const hrInfo = user.onboarding.hrFilledInfo;
    const userInfo = user.onboarding.userFilledInfo.personalDetails;

    const mailBody = getNewJoineeMailBody({
      fullName: hrInfo.name,
      firstName: hrInfo.name.split(" ")[0],
      designation: hrInfo.role || "Team Member",
      department: hrInfo.department || "Department",
      joiningDate: hrInfo.doj
        ? new Date(hrInfo.doj).toLocaleDateString("en-IN")
        : "TBD",
      email: user.email,
    });

    // Remove duplicates or filter invalid emails
    const toAddresses = [...new Set(allEmployeeMailIds.filter(Boolean))].join(',');

    const mailResult = await sendEmail({
      subject: ` Meet Our New Team Member - ${hrInfo.name}!`,
      body: mailBody,
      toAddress: toAddresses,
    });

    if (mailResult) {
      // console.log("✅ New joinee notification sent to all employees.");

      user.onboarding.hasNotifiedToAll = true;
      await user.save();
    }

  } catch (err) {
    console.error("❌ Failed to send new joinee notification:", err.message);
  }
}
//To get Email ids of all employees
async function getEmployeeRecords(access_token) {
  const url = "https://people.zoho.com/people/api/forms/P_EmployeeView/records";
  try {
    const resp = await axios.get(url, {
      params: {
        // Uncomment to filter by email alias:
        // searchColumn: 'EMPLOYEEMAILALIAS',
        // searchValue: id
      },
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
      },
    });
    const emailList = resp.data
      .map((r) => r["Email ID"]) // pick the “Email ID” property
      .filter((e) => e && e.trim());
    // console.log("Data:", emailList);

    return emailList;

  } catch (err) {
    console.error("Error while fetching Email Ids of employees",
      err.response ? err.response.data : err.message
    );
  }
}

// ======= PDF Generation =======

async function fetchImageAsBase64(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });

  const contentType = response.headers['content-type']; // e.g., 'image/png'
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return `data:${contentType};base64,${base64}`;
}

// Helper: format dates the same way you did before
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }); // e.g. Sep
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}


async function mergeOfferLetter(mergeData) {
  const accessToken = await getwebHookAccessToken();

  const form = new FormData();
  form.append("output_format", "pdf");          // pdf, docx, html, zfdoc, pdfform, zip(html)
  form.append("filename", "Offer_Letter");
  // form.append("test_mode", "true");          // optional: watermark test without credits
  form.append("merge_data", JSON.stringify({ data: [mergeData] }));
  form.append("response_type", "link");         // Zoho returns short-lived download URL

  const mergeUrl = `https://www.zohoapis.com/writer/api/v1/documents/${WRITER_DOCUMENT_ID}/merge`;

  const { data } = await axios.post(mergeUrl, form, {
    headers: { ...form.getHeaders(), Authorization: `Zoho-oauthtoken ${accessToken}` },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const downloadUrl = data && data.URL;
  if (!downloadUrl) throw new Error("No download URL returned from merge");

  const pdf = await axios.get(downloadUrl, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    responseType: "arraybuffer",
  });

  
  return Buffer.from(pdf.data);
}


// ======= Save Joinee ======= Step 1
async function saveJoineeDetails(req, res) {
  try {
    const {
      name,
      personalEmail,
      phone,
      baseSalary,
      annualCtc,
      department,
      role,
      isPfApplicable,
      isExperienced,
      doj,
      city,
      reportingLocation,
      gender
    } = req.body;

    const deptIsId = mongoose.isValidObjectId(department);
    const roleIsId = mongoose.isValidObjectId(role);

    const update = {
      email: personalEmail,
      onboarding: {
        hrFilledInfo: {
          name,
          personalEmail,
          phone,
          baseSalary,
          annualCtc,
          department,
          role,
          isPfApplicable,
          isExperienced,
          doj,
          city,
          reportingLocation,
          gender,
          initiatedBy: req.user ? req.user._id : null,
          initiatedAt: new Date(),
        },
      },
    };
    if (deptIsId) update.department = department;
    if (roleIsId) update.role = role;

    let savedUser = await User.findOne({ email: personalEmail });
    if (!savedUser) {
      savedUser = await User.create(update);
    } else {
      await User.updateOne({ email: personalEmail }, { $set: update });
    }

    // 🟡 Role name: use ID lookup if valid ObjectId, else treat as free text
    let roleName = 'Role';
    if (roleIsId) {
      const roleData = await Role.findById(role).lean();
      roleName = roleData?.name || roleName;
    } else if (typeof role === 'string' && role.trim()) {
      roleName = role.trim(); // free text from "Other"
    }
    const salutation = gender === 'female' ? 'Ms.' : 'Mr.';

    const mergeData = {
      "Name_Salutation": salutation,
      "Name_First": name.split(" ")[0],
      "Name_Last": name.split(" ").slice(1).join(" "),
      "SingleLine": city,
      "Dropdown": roleName,                // ✅ designation: ID name or free text
      "Date": formatDate(doj),
      "Number": annualCtc,
      "Number1": baseSalary,
      "Dropdown1": reportingLocation
    };
  // 2. Generate Offer Letter PDF
  const pdfBuffer = await mergeOfferLetter(mergeData);
  // console.log("Offer Letter PDF generated");
    const { subject, body } = getOfferLetterEmailTemplate({
      name,
      doj,
      onboardingLink: ONBOARDING_FORM_LINK,
    });

    await sendEmail({
      subject,
      body,
      toAddress: personalEmail,
      ccAddress: "hr@niveshonline.com",
      attachments: [
        { filename: "Offer Letter-Mr Vipul Kumar.pdf", content: pdfBuffer },
      ],
    });

    const userId = savedUser._id;
    const updateData = {
      status: "onboarding",
      "onboarding.offerLetter.generated": true,
      "onboarding.offerLetter.generatedAt": new Date(),
      "onboarding.offerLetter.sentToJoinee": true,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(201).json({
      success: true,
      message: "New Joinee details saved successfully",
      user: savedUser,
    });

  } catch (error) {
    console.error("Error creating joinee data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create joinee data",
      error: error.message,
    });
  }
}



// ======= Fetch All Joinees Status =======
async function statusDetailsAllJoinee(req, res) {
  try {
    const newJoiners = await User.find({ status: "onboarding" });
    const pendingVerification = await User.find({ status: "pending" });
    const assetToAllocate = await User.find({ status: "pending" });

    res.status(200).json({
      success: true,
      message: "Status details fetched successfully",
      data: {
        newJoinersCount: newJoiners.length,
        pendingVerificationCount: pendingVerification.length,
        assetToAllocateCount: assetToAllocate.length,
      },
    });
  } catch (error) {
    console.error("Error fetching status data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch status data",
      error: error.message,
    });
  }
}

// ======= Fetch All Incomplete Joinee Records =======
async function statusDetails(req, res) {
  try {
    const users = await User.find({
      status: { $in: ["pending", "onboarding"] },
    }).lean();
    return res.status(200).json({
      success: true,
      message: "Status details fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching status details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch status data",
      error: error.message,
    });
  }
}

// ======= Fetch Single Joinee Status =======
async function statusDetailsById(req, res) {
  try {
    const { id } = req.params;
    const users = await User.findOne({ _id: id }).lean();
    if (!users) {
      return res.status(404).json({
        success: false,
        message: "No onboarding status found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status details fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching status details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch status data",
      error: error.message,
    });
  }
}

// ======= Update hasAssetsAllocated =======
async function updateAssetAllocationStatus(req, res) {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { "onboarding.hasAssestAllocated": true } },
      { new: true } // return the updated document
    );

    if (!user) {
      return res.status(404)
        .json({ success: false, message: "User not found" });
    }

    // Sending Gotra Document 
    const hasGotraSent = await sendGotraDocument(user);

    if (!hasGotraSent) {
      throw new Error('Unable to Send Gotra Document.')
    }
    //sending New joinee Mail to all Employees
    await sentNewJoineeMailNotification(user);

    res.status(200).json({
      success: true,
      message: "Allocation status updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating allocation status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

// ========== [1] Fetch Existing Onboarding Data ==========
const fetchUserOnboardingInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const hrInfo = user.onboarding?.hrFilledInfo || {};
    const userInfo = user.onboarding?.userFilledInfo || {};
    const ndaInfo = user.onboarding?.nda || {};

    res.status(200).json({
      hrFilledInfo: hrInfo,
      personalDetails: userInfo.personalDetails || {},
      referenceDetails: userInfo.referenceDetails || {},
      bankDetails: userInfo.bankDetails || {},
      educationalCertificatesAndDegree: userInfo.educationalCertificatesAndDegree || {},
      submittedAt: userInfo.submittedAt || null,
      nda: ndaInfo
    });
  } catch (error) {
    console.error("Error fetching onboarding info:", error);
    res.status(500).json({ error: "Failed to fetch user onboarding data" });
  }
};

// ========== [2] Save Partial Onboarding Info ==========
const extractDriveFileId = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  return match ? match[1] : null;
};

const fetchDriveFileBuffer = async (fileId) => {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await axios.get(downloadUrl, {
    responseType: 'arraybuffer',
    headers: { 'Content-Type': 'application/octet-stream' }
  });
  return Buffer.from(response.data, 'binary');
};

const savePartialUserOnboardingInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const submitStatus = req.body;

    const userRecord = await User.findById(userId).lean();
    if (!userRecord) return res.status(404).json({ error: "User not found" });

    const sanitizedEmail = userRecord.email.replace(/[^a-zA-Z0-9]/g, '_');
    const isFinalSubmit = submitStatus.finalSubmit === 'true' || submitStatus.finalSubmit === true;
    const update = { $set: {} };

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('employee-onboarding');

    const azureUploadedFields = new Set();

    // === Upload Education Files ===
    const fileFields = {
      tenthMarksheetFile: 'tenthMarksheet',
      lastEducationFileUpload: 'lastEducationFile',
      latestUpdateCvUpload: 'latestUpdateCv',
    };

    if (req.files && Object.keys(req.files).length > 0) {
      for (const [field, dbField] of Object.entries(fileFields)) {
        const fileArr = req.files?.[field];
        if (fileArr?.length) {
          const file = fileArr[0];
          const blobName = `${Date.now()}-${sanitizedEmail}-${dbField}-${file.originalname}`;
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);

          await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
          });

          const blobUrl = `https://${containerClient.accountName}.blob.core.windows.net/${containerClient.containerName}/${blobName}`;
          update.$set[`onboarding.userFilledInfo.educationalCertificatesAndDegree.${dbField}`] = blobUrl;

          azureUploadedFields.add(dbField);
        }
      }
    }

    // === Upload Personal Photo & Bank Verification Doc ===
    const personalBankFiles = {
      'personalDetails.photo': 'photo',
      'bankDetails.bankVerificationDoc': 'bankVerificationDoc',
    };

    for (const [formField, dbField] of Object.entries(personalBankFiles)) {
      const fileArr = req.files?.[formField];

      if (fileArr?.length > 0) {
        const file = fileArr[0];
        const blobName = `${Date.now()}-${sanitizedEmail}-${dbField}-${file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype }
        });

        const blobUrl = `https://${containerClient.accountName}.blob.core.windows.net/${containerClient.containerName}/${blobName}`;
        const [section, field] = formField.split('.');

        if (typeof blobUrl === 'string' && blobUrl.startsWith('https://')) {
          update.$set[`onboarding.userFilledInfo.${section}.${field}`] = blobUrl;
        }
      } else {
        // ✅ Prevent setting an empty object accidentally
        console.warn(` file uploaded for ${formField}, skipping.`);
      }
    }



    // === Handle Google Drive Fallbacks for Education Files ===
    const driveFields = {
      tenthMarksheet: 'tenthMarksheet',
      lastEducationFile: 'lastEducationFile',
      latestUpdateCv: 'latestUpdateCv',
    };

    for (const [dbField] of Object.entries(driveFields)) {
      if (azureUploadedFields.has(dbField)) continue;

      const driveFieldPath = `educationalCertificatesAndDegree.${dbField}`;
      const url = submitStatus[driveFieldPath];

      if (typeof url === 'string' && url.startsWith('https://drive.google.com')) {
        const fileId = extractDriveFileId(url);
        if (fileId) {
          try {
            const buffer = await fetchDriveFileBuffer(fileId);
            const blobName = `${Date.now()}-${sanitizedEmail}-${dbField}-${fileId}.pdf`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadData(buffer, {
              blobHTTPHeaders: { blobContentType: 'application/pdf' }
            });

            const blobUrl = `https://${containerClient.accountName}.blob.core.windows.net/${containerClient.containerName}/${blobName}`;
            update.$set[`onboarding.userFilledInfo.educationalCertificatesAndDegree.${dbField}`] = blobUrl;

          } catch (err) {
            console.error(`❌ Failed to fetch/upload Drive file for ${dbField}:`, err.message);
          }
        }
      } else if (typeof url === 'string' && url.startsWith('https://')) {
        // Fallback: Use raw URL
        update.$set[`onboarding.userFilledInfo.educationalCertificatesAndDegree.${dbField}`] = url;
      }
    }

    // === Save Remaining Form Data ===
    for (const [key, value] of Object.entries(submitStatus)) {
      if (
        key !== 'finalSubmit' &&
        !key.startsWith('educationalCertificatesAndDegree') &&
        !(typeof value === 'object' && value !== null && Object.keys(value).length === 0) // skip empty objects
      ) {
        update.$set[`onboarding.userFilledInfo.${key}`] = value;
      }
    }


    // === Final Submit Timestamp ===
    if (isFinalSubmit) {
      update.$set['onboarding.userFilledInfo.submittedAt'] = new Date();
      // console.log("Updated Final submit submitedAt date")
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({
      message: isFinalSubmit ? 'Final submission successful' : 'Data saved',
      data: user.onboarding.userFilledInfo,
    });

  } catch (error) {
    console.error('❌ Error saving onboarding info:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
};


//Supporting function for below processSpringVerifyOrNda
const extractUserDetails = (user) => {
  const onboardingData = user.onboarding;
  const personal = onboardingData.userFilledInfo.personalDetails;
  const latestUpdateCv = onboardingData.userFilledInfo.educationalCertificatesAndDegree.latestUpdateCv;
  const hrFilled = onboardingData.hrFilledInfo;

  return {
    name: hrFilled.name,
    email: hrFilled.personalEmail,
    pan: personal.panNumber,
    phone: personal.phone,
    isExperienced: hrFilled.isExperienced,
    resume: latestUpdateCv,
    address: {
      street_address: personal.streetAddress,
      city: personal.city,
      state: personal.stateRegionProvince,
      pincode: personal.postalZipCode,
      country: personal.country,
    },
  };
};

const processSpringVerifyOrNda = async (req, res) => {
  try {
    // console.log("🔍 Incoming body:", req.body);
    const userId = req.body.userId;
    const user = await User.findById(userId).lean();

    // console.log("Received userId:", userId);


    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    // const userDetails = req.body;
    const email = user.onboarding.hrFilledInfo.personalEmail;
    const action = req.body.action; // 'verify' or 'skip'
    const userDetails = extractUserDetails(user);

    if (action === 'verify') {

      // console.log("Line 410", userDetails);

      // Step 1: Fetch SpringVerify package & add candidate
      const verifyRes = await fetchPackageAndAddCandidate(userId, userDetails);
      if (verifyRes.status === 'error') {
        console.error('❌ Error in fetchPackageAndAddCandidate:', verifyRes.message);
        return res.status(500).json(verifyRes);
      }

      // Step 2: Get candidate status
      const statusRes = await getCandidateStatus(userId, email);
      if (statusRes.status === 'error') {
        console.error('❌ Error in getCandidateStatus:', statusRes.message);
        return res.status(500).json(statusRes);
      }

      // Step 3: If background check status as verified or faled as per mapped spring status received
      const mappedSpringStatus = statusRes.data?.mappedStatus;
      if (mappedSpringStatus === "verified" || mappedSpringStatus === "failed") {
          await User.findByIdAndUpdate(userId, {
            $set: {
              "onboarding.backgroundCheck.status": mappedSpringStatus,
              "onboarding.backgroundCheck.completedAt": new Date(),
            },
          })
        if (mappedSpringStatus === "failed") {
          await sendEmail({
            toAddress: 'hr@niveshonline.com',
            subject: `SpringVerify Check Failed - ${email}`,
            body: `
            <p>Dear HR Team,</p>
      <p>The SpringVerify background check for the following user has <strong>failed</strong> due to insufficiency or other issues:</p>
      <ul>
        <li><strong>User Email:</strong> ${email}</li>
        <li><strong>User ID:</strong> ${userId}</li>
        <li><strong>Status:</strong> ${mappedSpringStatus}</li>
      </ul>
      <p>Please review the SpringVerify portal for detailed reasons and take the necessary next steps.</p>
      <p>Regards,<br/>Onboarding System</p
      `
          });
        }
      }

      return res.status(200).json({
        status: 'success',
        message: 'SpringVerify process completed',
        data: {
          springVerifyResponse: verifyRes.data,
          candidateStatus: statusRes.data,
        },
      });

    } else if (action === 'skip') {
      // Skip background check
      await User.findByIdAndUpdate(userId, {
        $set: {
          'onboarding.backgroundCheck.status': 'skipped',
        },
      });

      // console.log("Line 454", userDetails);

      const authToken = await getZohoAccessToken();
      // console.log("AuthToken is ", authToken);

      
      // await dispatchNdaFlow(userId, authToken, userDetails);

      return res.status(200).json({
        status: 'success', message: 'SpringVerify skipped, NDA workflow dispatched',
      });
    }

    return res.status(400).json({
      status: 'error', message: 'Invalid action type. Must be either "verify" or "skip".',
    });

  } catch (error) {
    console.error('processSpringVerifyOrNda error:', error);
    return res.status(500).json({
      status: 'error', message: 'Unexpected server error during onboarding', data: error.message,
    });
  }
};

// Fetch department details
const getAllDepartments = async (req, res) => {
  try {
    // Fetch all departments
    const getDeptData = await Department.find().select(
      "-__v -createdAt -updatedAt"
    );

    if (!getDeptData) {
      return res.status(404).json({
        message: "No department found.",
      });
    }

    res.status(200).json({
      message: "Department data retrieved successfully.",
      data: getDeptData,
    });
  } catch (err) {
    console.error("Department server error", err);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};

const getRoles = async (req, res) => {
  try {
    // Case 1: Fetch data as per department id
    if (req.query.dept) {
      const deptId = req.query.dept;
      const getRoleByDeptData = await Role.find({ department: deptId }).select(
        "-__v -createdAt -updatedAt"
      );
      if (!getRoleByDeptData) {
        console.error("Error in fetching individual role details.", err);
        return res.status(404).json({
          message: "No such roles with department id",
        });
      }
      return res.status(200).json({
        message: "Roles retrieved successfully.",
        data: getRoleByDeptData,
      });
    }

    // Case 2: Fetch All Roles Data
    const getRoleData = await Role.find().populate("department");
    if (!getRoleData) {
      return res.status(404).json({
        message: "No roles found.",
      });
    }

    res.status(200).json({
      message: "Roles retrieved successfully.",
      data: getRoleData,
    });
  } catch (err) {
    console.error("Error in fetching individual role details.", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};


// DELETE /api/onboarding/delete/:id
const deleteJoinee = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await User.findByIdAndDelete(id);  

    if (!result) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ======= EXPORT ==========
// ======= EXPORT ==========
module.exports = {
  saveJoineeDetails,
  statusDetailsAllJoinee,
  statusDetails,
  statusDetailsById,
  updateAssetAllocationStatus,
  fetchUserOnboardingInfo,
  savePartialUserOnboardingInfo,
  processSpringVerifyOrNda,
  getAllDepartments,
  getRoles,
  generateOnboardingLink,
  deleteJoinee,
  mergeOfferLetter,
};

