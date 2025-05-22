const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const axios = require("axios");
const Department = require("../../models/Department");
const Role = require("../../models/Role");
const { fetchPackageAndAddCandidate, getCandidateStatus } = require('./springVerifyControllers');
const { dispatchNdaFlow } = require('../../utils/ndaWorkFlow');
const { getZohoAccessToken } = require("../../utils/getZohoAccessToken");


// zoho setup
const BASE_URL =
  "https://people.zoho.com/people/api/forms/json/employee/insertRecord";

// Sending Gotra to new employees Via Mail
async function sendGotraDocument(userId) {
  // 1. Load the user
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  // 2. Fetch the PDF from blob storage
  const gotraUrl =
    "https://mfdatafeed.blob.core.windows.net/onboarding/Gotraka_-_HR_guideline_2023_.pdf";
  const response = await axios.get(gotraUrl, { responseType: "arraybuffer" });
  const pdfBuffer = Buffer.from(response.data, "binary");

  // 3. Send email
  const to = user.email;
  const name = user.onboarding.hrFilledInfo.name;
  await sendEmail(
    "Your Gotra Guideline Document",
    `<p>Dear ${name},</p>
     <p>Please find attached the Gotra guideline document for your reference.</p>
     <p>Regards,<br/>HR Team</p>`,
    to,
    "",
    { "Gotra_Guideline.pdf": pdfBuffer }
  );

  // 4. Update and save
  user.onboarding.gotra.sent = true;
  user.onboarding.gotra.sentAt = new Date();
  await user.save();

  return user.onboarding.gotra;
}

// Supporting function to check if E-mail exists & Add new Employee to Zoho
async function zohoApiOnboarding(access_token, record) {
  const params = {
    inputData: JSON.stringify(record),
  };

  const headers = {
    Authorization: `Zoho-oauthtoken ${access_token}`,
  };
  try {
    const resp = await axios.get(BASE_URL, { params, headers });
    const errors = resp.data.response?.errors.code;
    if (errors === 7006) return 1;

    return 0;
  } catch (err) {
    console.error("Request failed:", err.response?.data || err.message);
    return -1;
  }
}

// Generating Unique Email id for new Employee
async function registerEmployeeInZohoById(id, access_token) {
  const user = await User.findById(id);
  var finalEmail = "";
  if (!user) throw { status: 404, message: "User not found" };
  const domain = "@niveshonline.com";
  var first = user.onboarding.hrFilledInfo.name.split(" ")[0];
  // first = "abhishek";
  var email = first + domain;
  var records = {
    EmployeeID: id.toString(),
    FirstName: user.onboarding.hrFilledInfo.name.split(" ")[0],
    LastName: user.onboarding.hrFilledInfo.name.split(" ")[0],
    EmailID: email,
  };
  var result = await zohoApiOnboarding(access_token, records);
  console.log(zohoApiOnboarding(access_token, records));
  if (result === 1) {
    var second =
      "." +
      user.onboarding.hrFilledInfo.name.split(" ")[0].charAt(0).toLowerCase();
    email = first + second + domain;
    records = {
      EmployeeID: id.toString(),
      FirstName: user.onboarding.hrFilledInfo.name.split(" ")[0],
      LastName: user.onboarding.hrFilledInfo.name.split(" ")[0],
      EmailID: email,
    };
    result = await zohoApiOnboarding(access_token, records);
    if (result == 1) {
      second =
        "." + user.onboarding.hrFilledInfo.name.split(" ")[0].toLowerCase();
      email = first + second + domain;
      records = {
        EmployeeID: id.toString(),
        FirstName: user.onboarding.hrFilledInfo.name.split(" ")[0],
        LastName: user.onboarding.hrFilledInfo.name.split(" ")[0],
        EmailID: email,
      };
      result = await zohoApiOnboarding(access_token, records);
      if (result == 1) {
        first = first + second;
        for (var i = 1; ; i++) {
          second = i;
          email = first + second + domain;
          records = {
            EmployeeID: id.toString(),
            FirstName: user.onboarding.hrFilledInfo.name.split(" ")[0],
            LastName: user.onboarding.hrFilledInfo.name.split(" ")[0],
            EmailID: email,
          };
          result = await zohoApiOnboarding(access_token, records);
          if (result == 0) {
            break;
          }
        }
        finalEmail = email;
      } else {
        finalEmail = email;
      }
    } else {
      finalEmail = email;
    }
  } else {
    finalEmail = email;
  }
  return finalEmail;
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
  } catch (err) {
    console.error(
      "Error fetching records:",
      err.response ? err.response.data : err.message
    );
  }
}

// Main function to Add new Employee in Zoho
async function newEmployeeSetup(userId) {
  try {
    // const id = "66d94d8860115997c619a5db";
    const access_token = await getZohoAccessToken();

    const finalEmail = await registerEmployeeInZohoById(userId, access_token);
    // console.log(finalEmail);
    // await getEmployeeRecords(access_token);
    // const gotraStatus = await sendGotraDocument(id);
    return res.status(200).json({
      success: true,
      message: "add employee successfully",
      email: finalEmail,
      // gotra: gotraStatus
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: `error ${err.message}` });
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
      doj,
    } = req.body;
    const filter = { email: personalEmail };

    const update = {
      role: "664ecd97efdcf936376851d2",
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
          doj,
          initiatedBy: req.user ? req.user._id : null,
          initiatedAt: new Date(),
        },
      },
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const savedUser = await User.findOneAndUpdate(filter, update, options);

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

    await sendEmail(subject, body, toAddress, ccAddress, {
      "offerLetter.pdf": pdfBuffer,
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({
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

    // Save user-filled onboarding info
    // await User.findByIdAndUpdate(userId, {
    //   $set: {
    //     'onboarding.userFilledInfo': userDetails,
    //   },
    // });

    if (action === 'verify') {
      // Step 1: Fetch SpringVerify package & add candidate
      const verifyRes = await fetchPackageAndAddCandidate(userId, userDetails);
      if (verifyRes.status === 'error') {
        return res.status(500).json(verifyRes);
      }

      // Step 2: Get candidate status
      const statusRes = await getCandidateStatus(userId, email);
      if (statusRes.status === 'error') {
        return res.status(500).json(statusRes);
      }

      // Step 3: If background check is completed, mark it as verified
      if (statusRes.data === 'Completed') {
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
      const onboardingData = user.onboarding;
      console.log("Line 554",onboardingData);
      const onboardingPersonalData = onboardingData.userFilledInfo.personalDetails;

      const userDetails = {
        name: onboardingData.hrFilledInfo.name,
        email: onboardingData.hrFilledInfo.personalEmail,
        pan: onboardingPersonalData.panNumber,
        address: {
          street_address: onboardingPersonalData.streetAddress,
          city: onboardingPersonalData.city,
          state: onboardingPersonalData.stateRegionProvince,
          pincode: onboardingPersonalData.postalZipCode,
          country: onboardingPersonalData.country,
        }
      }
      console.log("Line 569", userDetails);

      const authToken = await getZohoAccessToken();
      console.log("AuthToken is ",authToken);
      
      // const authToken = '1000.307794b3c011921e299b4d0acd359eb5.88738d4c43f9d4e9366cc6217bbb30b3'
      await dispatchNdaFlow(userId, authToken, userDetails);

      return res.status(200).json({
        status: 'success',
        message: 'SpringVerify skipped, NDA workflow dispatched',
      });
    }

    return res.status(400).json({
      status: 'error',
      message: 'Invalid action type. Must be either "verify" or "skip".',
    });

  } catch (error) {
    console.error('processSpringVerifyOrNda error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Unexpected server error during onboarding',
      data: error.message,
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

const ndaSignedWebhook = async (req, res) => {
  const payload = req.body;
  console.log("Webhook Received:", JSON.stringify(payload));

  const { requests } = payload;
  try {
    if (requests?.actions[0].action_status === 'SIGNED') {

      const employee = requests.actions.find(a => a.action_type === 'SIGN');
      if (employee?.action_status === 'SIGNED') {
        // ✅ Employee has signed — perform next step
        const requestId = requests.request_id;
        const signedAt = new Date();

        // ✅ Update the user's NDA status using requestId
        const updated = await User.findOneAndUpdate(
          { 'onboarding.nda.requestId': requestId },
          {
            $set: {
              'onboarding.nda.signed': true,
              'onboarding.nda.signedAt': signedAt,
            }
          }, { new: true }
        );

        if (updated) {
          console.log(`✅ NDA marked as signed for: ${updated.email}`);
          newEmployeeSetup(updated._id);
        } else {
          console.warn(`⚠️ No user found with requestId: ${requestId}`);
        }
      }
    }
    res.sendStatus(200); // Acknowledge receipt

  } catch (error) {
    console.error('❌ Error handling NDA signed webhook:', error.message);
    res.sendStatus(500);
  }
}


// ======= EXPORT ==========
// ======= EXPORT ==========

module.exports = {
  saveJoineeDetails,
  statusDetailsAllJoinee,
  statusDetails,
  statusDetailsById,
  updateAllocationStatus: updateAssetAllocationStatus,
  fetchUserOnboardingInfo,
  savePartialUserOnboardingInfo,
  processSpringVerifyOrNda,
  newEmployeeSetup,
  getAllDepartments,
  getRoles,
  ndaSignedWebhook
};
