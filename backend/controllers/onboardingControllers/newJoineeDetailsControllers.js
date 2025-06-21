const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const axios = require("axios");
const Department = require("../../models/Department");
const Role = require("../../models/Role");
const { fetchPackageAndAddCandidate, getCandidateStatus } = require('./springVerifyControllers');
const { dispatchNdaFlow } = require('../../utils/ndaWorkFlow');
const { getZohoAccessToken } = require("../../utils/getZohoAccessToken");
const { getwebHookAccessToken } = require("../../utils/webHookAccessToken");
const { getNewJoineeMailBody } = require("../../utils/newJoineeMailTemplate");
const sendEmail = require("../../utils/sendEmail");



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
      console.log("✅ New joinee notification sent to all employees.");

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
    console.log("Data:", emailList);

    return emailList;

  } catch (err) {
    console.error("Error while fetching Email Ids of employees",
      err.response ? err.response.data : err.message
    );
  }
}

// ======= PDF Generation =======
function generateOfferLetterPDF({
  name,
  role,
  department,
  baseSalary,
  annualCtc,
}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.fontSize(20).text("Offer Letter", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown(2);
      doc.text(`Dear ${name},`);
      doc.moveDown();
      doc.text(
        `We are delighted to offer you the position of ${role} in our ${department} department.`
      );
      doc.moveDown();
      doc.text(
        `Your base salary will be ${baseSalary} and your annual CTC is ${annualCtc}.`
      );
      doc.moveDown();
      doc.text(
        `Please review the terms and conditions outlined in this offer letter. We are excited about the prospect of you joining our team.`
      );
      doc.moveDown(2);
      doc.text("Best regards,");
      doc.text("The HR Team");

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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
    } = req.body;
    const filter = { email: personalEmail };

    const update = {
      email: personalEmail, // Set personalEmail to top-level email also as this field is required
      department,
      role,

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
          initiatedBy: req.user ? req.user._id : null,
          initiatedAt: new Date(),
        },
      },
    };



    const savedUser = await User.create(update);

    const pdfBuffer = await generateOfferLetterPDF({
      name,
      role,
      department,
      baseSalary,
      annualCtc,
    });
    const subject =
      "Offer Letter from 'Milestone Global Moneymart Private Limited'";
    const body = `
      <h1>Dear ${name},</h1>
      <p>We are pleased to extend to you an offer of employment. Please find your official offer letter attached to this email.</p>
      <p>We look forward to welcoming you to the team and are excited about the contributions you will bring to our organization.</p>
      <p>Should you have any questions, feel free to reach out.</p>
      <p>Sincerely,<br/>Milestone HR Team</p>
    `;

    const toAddress = personalEmail;
    const ccAddress = "";

    await sendEmail({
      subject,
      body,
      toAddress,
      ccAddress,
      attachments: [
        {
          filename: "offerLetter.pdf",
          content: pdfBuffer
        }
      ]
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
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(201).json({
      success: true,
      message: "New Joinee details saved successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error creating joinee data:", error.message);
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

    const savedInfo = user.onboarding?.userFilledInfo || {};
    res.status(200).json(savedInfo);
  } catch (error) {
    console.error("Error fetching onboarding info:", error);
    res.status(500).json({ error: "Failed to fetch user onboarding data" });
  }
};

// ========== [2] Save Partial Onboarding Info ==========
const savePartialUserOnboardingInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const update = { $set: {} };
    const submitStatus = req.body;

    const isFinalSubmit = submitStatus.finalSubmit === true;

    for (const [key, value] of Object.entries(submitStatus)) {
      if (key !== "finalSubmit") {
        update.$set[`onboarding.userFilledInfo.${key}`] = value;
      }
    }

    if (isFinalSubmit) {
      update.$set["onboarding.userFilledInfo.submittedAt"] = new Date();
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: isFinalSubmit ? "Final submission successful" : "Data saved",
      data: user.onboarding.userFilledInfo,
    });
  } catch (error) {
    console.error("Error saving onboarding info:", error);
    res.status(500).json({ error: "Failed to save onboarding data" });
  }
};

//Supporting function for below processSpringVerifyOrNda
const extractUserDetails = (user) => {
  const onboardingData = user.onboarding;
  const personal = onboardingData.userFilledInfo.personalDetails;
  const hrFilled = onboardingData.hrFilledInfo

  return {
    name: hrFilled.name,
    email: hrFilled.personalEmail,
    pan: personal.panNumber,
    phone: personal.phone,
    isExperienced: hrFilled.isExperienced,
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
    console.log("🔍 Incoming body:", req.body);
    const userId = req.body.userId;
    const user = await User.findById(userId).lean();

    console.log("Received userId:", userId);


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

      console.log("Line 410", userDetails);

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

      // Step 3: If background check is completed, mark it as verified
      if (statusRes.data?.springStatus === 'Completed') {
        await User.findByIdAndUpdate(userId, {
          $set: {
            'onboarding.backgroundCheck.status': 'verified',
            'onboarding.backgroundCheck.completedAt': new Date(),
          },
        });

        // Step 4: Dispatch NDA
        await dispatchNdaFlow(userId, userDetails);
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

      console.log("Line 454", userDetails);

      const authToken = await getZohoAccessToken();
      console.log("AuthToken is ", authToken);

      await dispatchNdaFlow(userId, authToken, userDetails);

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
};
