
function getOfferLetterEmailTemplate({ name, doj, onboardingLink }) {
  return {
    subject: "Offer Letter from 'Milestone Global Moneymart Private Limited'",
    body: `
      <p>Dear ${name},</p>

      <p>I would like to congratulate you on clearing all rounds of interview and also would like to welcome you to our family.</p>

      <p>As per our discussion, you may find your offer letter attached to the mail. This offer letter is valid for the next 2 working days, and your joining date is mentioned in the offer letter. Reply to this mail will be considered as acceptance of your offer letter.</p>

      <p>To complete your onboarding, you'll have to fill the form <a href="${onboardingLink}" target="_blank">Employee Onboarding Form</a></p>

      <p>You'll soon receive a mail containing a copy of Non-Disclosure Agreement and copy of our HR policy.</p>

      <p>For any queries, whatsoever, you may contact the undersigned.</p>

      <p>Congratulations on your appointment. I wish you all the best for our future relationship.</p>

      <br/>
      <p><strong>Thanks & Regards</strong></p>
      <p><strong>Vilakshan Bhutani</strong><br/>
      CEO - Chief Executive Officer<br/>
      M: +91 99 100 76952</p>

      <p><strong>Milestone Global Moneymart Private Limited</strong><br/>
      <em>a pathway to achieve financial milestones</em></p>

      <p><strong>IVR:</strong> +91 8269 135135 &nbsp;&nbsp; 
         <strong>O:</strong> +91-11-45510989 / 47010647</p>

      <p>Corp. Office: 101-G | Crown Heights | Twin District Tower <br/>
      Rohini Sector 10 | New Delhi | Delhi – 110085</p>

      <p>Branch Office: 166-P | Railway Road | Ferozepur Cantt. | Punjab – 152001</p>

      <p><a href="https://www.niveshonline.com" target="_blank">Web: www.Niveshonline.com</a></p>
    `
  };
}

module.exports = { getOfferLetterEmailTemplate };
