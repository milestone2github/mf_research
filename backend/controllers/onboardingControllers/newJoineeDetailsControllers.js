const User = require("../../models/User");
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// ======= PDF Generation =======
function generateOfferLetterPDF({ name, role, department, baseSalary, annualCtc }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.fontSize(20).text('Offer Letter', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown(2);
      doc.text(`Dear ${name},`);
      doc.moveDown();
      doc.text(`We are delighted to offer you the position of ${role} in our ${department} department.`);
      doc.moveDown();
      doc.text(`Your base salary will be ${baseSalary} and your annual CTC is ${annualCtc}.`);
      doc.moveDown();
      doc.text(`Please review the terms and conditions outlined in this offer letter. We are excited about the prospect of you joining our team.`);
      doc.moveDown(2);
      doc.text('Best regards,');
      doc.text('The HR Team');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ======= Email Sending =======
async function sendEmail(subject, body, toAddress, ccAddress, attachmentFiles = {}) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.zeptomail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'emailapikey',
      pass: 'wSsVR60gq0X2W6d8yjb/Lutpmg8BAFOlHEt0iwPw4if/S/uXosc5n02bVgX1T/NORDVgFDRHpuounRtV0TsJj955mQwHCiiF9mqRe1U4J3x17qnvhDzCX29UlRuJL4wBxg9ikmhoEcgr+g=='
    }
  });

  const attachments = [];
  for (const filename in attachmentFiles) {
    if (attachmentFiles.hasOwnProperty(filename)) {
      attachments.push({
        filename: filename,
        content: attachmentFiles[filename],
        contentType: 'application/pdf'
      });
    }
  }

  const mailOptions = {
    from: 'hr@mnivesh.niveshonline.com',
    to: toAddress,
    cc: ccAddress,
    subject: subject,
    html: body,
    attachments: attachments
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
    const { name, personalEmail, phone, baseSalary, annualCtc, department, role, isPfApplicable, doj } = req.body;
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
          initiatedAt: new Date()
        }
      }
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const savedUser = await User.findOneAndUpdate(filter, update, options);

    const pdfBuffer = await generateOfferLetterPDF({ name, role, department, baseSalary, annualCtc });
    const subject = "Offer Letter from 'Milestone Global Moneymart Private Limited'";
    const body = `
      <h1>Dear ${name},</h1>
      <p>We are pleased to extend to you an offer of employment. Please find your official offer letter attached to this email.</p>
      <p>We look forward to welcoming you to the team and are excited about the contributions you will bring to our organization.</p>
      <p>Should you have any questions, feel free to reach out.</p>
      <p>Sincerely,<br/>Milestone HR Team</p>
    `;

    const toAddress = personalEmail; 
    const ccAddress = "";

    await sendEmail(subject, body, toAddress, ccAddress, { "offerLetter.pdf": pdfBuffer });

    const userId = savedUser._id;
    const updateData = {
      status: 'onboarding',
      'onboarding.offerLetter.generated': true,
      'onboarding.offerLetter.generatedAt': new Date(),
      'onboarding.offerLetter.sentToJoinee': true
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(201).json({
      success: true,
      message: 'New Joinee details saved successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error creating joinee data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create joinee data',
      error: error.message,
    });
  }
}

// ======= Fetch All Joinees Status =======
async function statusDetailsAllJoinee(req, res) {
  try {
    const newJoiners = await User.find({ status: 'onboarding' });
    const pendingVerification = await User.find({ status: 'pending' });
    const assetToAllocate = await User.find({ status: 'pending' });

    res.status(200).json({
      success: true,
      message: 'Status details fetched successfully',
      data: {
        newJoinersCount: newJoiners.length,
        pendingVerificationCount: pendingVerification.length,
        assetToAllocateCount: assetToAllocate.length,
      }
    });
  } catch (error) {
    console.error('Error fetching status data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status data',
      error: error.message,
    });
  }
}

// ======= Fetch All Incomplete Joinee Records =======
async function statusDetails(req, res) {
  try {
    const users = await User.find({ status: { $ne: "complete" } }).lean();
    return res.status(200).json({
      success: true,
      message: "Status details fetched successfully",
      data: users
    });
  } catch (error) {
    console.error("Error fetching status details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch status data",
      error: error.message
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
        message: "No onboarding status found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status details fetched successfully",
      data: users
    });
  } catch (error) {
    console.error("Error fetching status details:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch status data",
      error: error.message
    });
  }
}

// ======= Update hasAssetsAllocated =======
async function updateAssetAllocationStatus(req, res) {
  const { userId } = req.params;
  
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'onboarding.hasAssestAllocated': true } },
      { new: true }      // return the updated document
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Allocation status updated successfully', data: user });
  } catch (error) {
    console.error('Error updating allocation status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}

// ======= EXPORT ==========
// ======= EXPORT ==========

module.exports = {
  saveJoineeDetails,
  statusDetailsAllJoinee,
  statusDetails,
  statusDetailsById,
  updateAllocationStatus: updateAssetAllocationStatus  // ✅ Mapping done here
};

