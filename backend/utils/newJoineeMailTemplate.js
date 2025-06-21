function getNewJoineeMailBody({
  fullName,
  firstName,
  designation,
  department,
  joiningDate,
  email,
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">🌟 Meet Our New Team Member – ${fullName}!</h2>
      
      <p>Hi Team,</p>

      <p>
        I’m excited to introduce you to our newest team member, 
        <strong>${fullName}</strong>, who has joined us as a 
        <strong>${designation}</strong> in the 
        <strong>${department}</strong> department. 
        They will be officially starting from <strong>${joiningDate}</strong>.
      </p>

      <h3 style="margin-top: 24px;">Here’s a quick introduction:</h3>
      <ul>
        <li><strong>Name:</strong> ${fullName}</li>
        <li><strong>Role:</strong> ${designation}</li>
        <li><strong>Department:</strong> ${department}</li>
        <li><strong>Email ID:</strong> <a href="mailto:${email}">${email}</a></li>
      </ul>

      <p>
        We are thrilled to welcome ${firstName} on board and are confident that 
        their skills and passion will be a great addition to our team.
      </p>

      <p>Please take a moment to welcome ${firstName} personally and help them feel at home.</p>

      <p>Warm regards,<br/>
      <strong>Your HR Team</strong></p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #ccc;"/>

      <p style="font-style: italic; color: #888;">
        “Coming together is a beginning. Keeping together is progress. 
        Working together is success.” – Henry Ford
      </p>
    </div>
  `;
}

module.exports = { getNewJoineeMailBody };