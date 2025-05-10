const Otp = require('../../models/Otp');
const User = require('../../models/User');
const axios = require('axios');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// --- SEND OTP via SMS ---
async function sendOtpSms(req, res) {
  let otp = Math.ceil(Math.random() * 10000);
  if (otp < 1000) otp += 1000;

  const pid = req.body.phone;
  const smsOtpUrl = `https://2factor.in/API/R1/?module=TRANS_SMS&apikey=${process.env.TWO_FACTOR_API_KEY}&to=${pid}&from=mNIVSH&templatename=otp_template&var1=${otp}`;

  try {
    await axios.get(smsOtpUrl); // must be GET, not POST

    await Otp.findOneAndUpdate(
      { phone: pid },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'OTP sent via SMS', data: pid });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
}




// --- VERIFY OTP ---
async function verifyOtp(req, res) {
  const {  phone, otp } = req.body;

  if (!otp || !phone) {
    return res.status(400).json({ error: 'Contact and OTP are required.' });
  }

  const query =  { 'onboarding.hrFilledInfo.phone': phone };

  try {
    const otpDoc = await Otp.findOne({phone});

    if (!otpDoc || otpDoc.otp !== Number(otp)) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    let user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({error: 'User not found in DB'});
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      message: 'OTP verified successfully.',
      data: { token, user }
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ error: 'Error during OTP verification.' });
  }
}


module.exports = {
  sendOtpSms,
  verifyOtp
};
