const Otp = require('../../models/Otp');
const User = require('../../models/User');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// --- SEND OTP via SMS ---
async function sendOtpSms(req, res) {
  let otp = Math.ceil(Math.random() * 10000);
  if (otp < 1000) otp += 1000;

  const phone = req.body.phone;

  const baseUrl = "https://2factor.in/API/V1/";
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  const template = "mverify";

  const finalUrl = `${baseUrl}${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(phone)}/${encodeURIComponent(otp)}/${encodeURIComponent(template)}`;
  
  try {
    await axios.get(finalUrl);

    await Otp.findOneAndUpdate(
      { phone },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    if(!Otp) {
      return res.status(400).json({ error: 'Failed to send OTP' });
    }

    res.status(200).json({ message: 'OTP sent via SMS ✅', data: phone });
  } catch (error) {
    console.error('error message: ', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
}




// --- VERIFY OTP ---
async function verifyOtp(req, res) {
  const { phone, otp } = req.body;

  if (!otp || !phone) {
    return res.status(400).json({ error: 'Contact and OTP are required.' });
  }

  const query = { 'onboarding.hrFilledInfo.phone': phone };

  try {
    const otpDoc = await Otp.findOne({ phone });

    if (!otpDoc || otpDoc.otp !== Number(otp)) {
      return res.status(400).json({ error: ' ❌ Invalid or expired OTP. ❌' });
    }

    let user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ error: 'User not found in DB' });
    }
    // Set OTP verified status in session
    req.session.otpVerified = true;
    const otpStatus = req.session.otpVerified

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(200).json({
      message: ' ✅ OTP verified successfully. ✅',
      data: { token, user, otpVerified: otpStatus }
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({ error: ' ❌ Error during OTP verification. ❌' });
  }
}

// check otpVerifiedStatus
async function otpVerifiedStatus(req, res) {
  try {
    const otpVerified = req.session.otpVerified || false;

    if (otpVerified) {
      res.sendStatus(200); // OK
    } else {
      res.sendStatus(401); // Unauthorized
    }
  } catch (error) {
    console.error(' ❌ Error checking OTP verification:', error);
    res.sendStatus(500);
  }
}



module.exports = {
  sendOtpSms,
  verifyOtp,
  otpVerifiedStatus
};
