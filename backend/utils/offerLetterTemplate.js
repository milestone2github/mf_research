const { HR_NAME } = require("./constants");

function getOfferLetterEmailTemplate({ name, doj, onboardingLink }) {
  // Capitalize first name only
  const firstName = ((name || "").trim().split(" ")[0] || "")
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());


  return {
    subject: "Offer Letter from Mnivesh",
    body: `
      <p>Dear ${firstName},</p>

      <p>I would like to congratulate you on clearing all rounds of interview and also would like to welcome you to our family.</p>

      <p>As per our discussion, you may find your offer letter attached to the mail. This offer letter is valid for the next 2 working days, and your joining date is mentioned in the offer letter. Reply to this mail will be considered as acceptance of your offer letter.</p>

      <p>To complete your onboarding, you'll have to fill the form <a href="${onboardingLink}" target="_blank">Employee Onboarding Form</a></p>

      <p>You'll soon receive a mail containing a copy of Non-Disclosure Agreement and copy of our HR policy.</p>

      <p>For any queries, whatsoever, you may contact the undersigned.</p>

      <p>Congratulations on your appointment. I wish you all the best for our future relationship.</p>

      <br/>

      <p><strong>Thanks & Regards</strong></p>
      <p><strong>${HR_NAME}, Hr</strong></p>
 
      <p>
        <a href="https://niveshonline.com/about-us" target="_blank" style="text-decoration:none;">
          <img 
            src="https://niveshonline.com/images/LOGOfinal.png"
            alt="Mnivesh Logo" 
            style="height:60px; border:0; margin-top:8px;"
          />
        </a>
      </p>

      <p>
        <a href="https://niveshonline.com/about-us" target="_blank">
          https://niveshonline.com/about-us
        </a>
      </p>
    `
  };
}

module.exports = { getOfferLetterEmailTemplate };
