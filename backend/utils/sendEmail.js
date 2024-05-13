const generateHtmlContent = require('./generateHtmlContent');
const nodemailer = require('nodemailer')

// Email configuration
const mailConfig = {
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false,
  auth: {
    user: "emailapikey",
    pass: process.env.SMTP_PASSWORD,
  },
};


// Function to send email
async function sendEmail(subject, data, toAddress) {
  let transporter = nodemailer.createTransport(mailConfig);

  let mailOptions = {
    from: "noreply@mnivesh.niveshonline.com",
    to: toAddress,
    subject: subject,
    html: generateHtmlContent(data),
  };

  try {
    let mailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", mailResponse.messageId);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

module.exports = sendEmail;