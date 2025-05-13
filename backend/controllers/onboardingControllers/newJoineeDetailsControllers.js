const User = require("../../models/User");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const axios = require("axios");
const Department = require("../../models/Department");
const Role = require("../../models/Role");
// zoho setup
const BASE_URL =
  "https://people.zoho.com/people/api/forms/json/employee/insertRecord";

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

async function zohoApiOnboarding(val, record) {
  const params = {
    inputData: JSON.stringify(record),
  };

  const headers = {
    Authorization: `Zoho-oauthtoken ${val}`,
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

async function registerEmployeeInZohoById(id, val) {
  const user = await User.findById(id);
  var finalEmail = "";
  if (!user) throw { status: 404, message: "User not found" };
  const domain = "@niveshonline.com";
  var first = user.onboarding.hrFilledInfo.name.split(" ")[0];
  first = "abhishek";
  var email = first + domain;
  var records = {
    EmployeeID: id.toString(),
    FirstName: user.onboarding.hrFilledInfo.name.split(" ")[0],
    LastName: user.onboarding.hrFilledInfo.name.split(" ")[0],
    EmailID: email,
  };
  var result = await zohoApiOnboarding(val, records);
  console.log(zohoApiOnboarding(val, records));
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
    result = await zohoApiOnboarding(val, records);
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
      result = await zohoApiOnboarding(val, records);
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
          result = await zohoApiOnboarding(val, records);
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

async function getEmployeeRecords(val) {
  const url = "https://people.zoho.com/people/api/forms/P_EmployeeView/records";
  try {
    const resp = await axios.get(url, {
      params: {
        // Uncomment to filter by email alias:
        // searchColumn: 'EMPLOYEEMAILALIAS',
        // searchValue: id
      },
      headers: {
        Authorization: `Zoho-oauthtoken ${val}`,
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

async function newEmployeeSetup(req, res) {
  try {
    const id = "66d94d8860115997c619a5db";
    const val =
      "1000.b862d56b65aa76578c8ba3dbed6f4f46.b7093143009dec4159a5c4063e090833";
    const finalEmail = await registerEmployeeInZohoById(id, val);
    // console.log(finalEmail);
    // await getEmployeeRecords(val);
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

// ======= Email Sending =======
async function sendEmail(
  subject,
  body,
  toAddress,
  ccAddress,
  attachmentFiles = {}
) {
  const transporter = nodemailer.createTransport({
    host: "smtp.zeptomail.com",
    port: 587,
    secure: false,
    auth: {
      user: "emailapikey",
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const attachments = [];
  for (const filename in attachmentFiles) {
    if (attachmentFiles.hasOwnProperty(filename)) {
      attachments.push({
        filename: filename,
        content: attachmentFiles[filename],
        contentType: "application/pdf",
      });
    }
  }

  const mailOptions = {
    from: "hr@mnivesh.niveshonline.com",
    to: toAddress,
    cc: ccAddress,
    subject: subject,
    html: body,
    attachments: attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

// ======= Save Joinee =======
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

    for (const [key, value] of Object.entries(req.body)) {
      update.$set[`onboarding.userFilledInfo.${key}`] = value;
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res
      .status(200)
      .json({ message: "Data saved", data: user.onboarding.userFilledInfo });
  } catch (error) {
    console.error("Error saving onboarding info:", error);
    res.status(500).json({ error: "Failed to save onboarding data" });
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
  updateAllocationStatus: updateAssetAllocationStatus,
  fetchUserOnboardingInfo,
  savePartialUserOnboardingInfo,
  newEmployeeSetup,
  getAllDepartments,
  getRoles,
};
