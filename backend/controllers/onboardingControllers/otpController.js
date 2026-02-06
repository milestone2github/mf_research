const Otp = require('../../models/Otp');
const User = require('../../models/User');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { WA_WATI_URL } = require('../../utils/constants');

// --- SEND OTP via WhatsApp ---

async function sendWATemplateMessage(whatsappNumber, otp) {
  if (!whatsappNumber) {
    throw new Error('Please provide a valid WhatsApp number');
  }

  // Add +91 if only 10 digits
  if (whatsappNumber.length === 10) {
    whatsappNumber = '+91' + whatsappNumber;
  }

  const url = WA_WATI_URL(whatsappNumber);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.WA_TOKEN}`,
  };

  const payload = {
    broadcast_name: process.env.WA_BROADCAST,
    template_name: 'otp_send',
    parameters: [
      {
        name: '1',
        value: String(otp), // MUST be string
      },
    ],
  };

  const response = await axios.post(url, payload, { headers });
  const data = response.data;

  //  TEMP DEBUG (keep for now)
  console.log('WATI RESPONSE:', JSON.stringify(data));

  //  ONLY case where we fallback to SMS
  if (data?.validWhatsAppNumber === false) {
    const err = new Error('NOT_WHATSAPP_NUMBER');
    err.code = 'NOT_WHATSAPP';
    throw err;
  }

  // WhatsApp exists but send failed → CONFIG ISSUE
  if (data?.result !== true) {
    throw new Error('WATI_SEND_FAILED');
  }

  return true;
}



async function sendOtpSmsInternal(phone, otp) {
  const baseUrl = "https://2factor.in/API/V1/";
  const apiKey = process.env.TWO_FACTOR_API_KEY;
  const template = "mverify";

  const finalUrl = `${baseUrl}${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(phone)}/${encodeURIComponent(otp)}/${encodeURIComponent(template)}`;

  await axios.get(finalUrl);
}


const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

// --- SEND OTP ---
async function sendOtp(req, res) {
  const { phone, forceSms } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone required' });
  }

  const now = Date.now();
  let otpDoc = await Otp.findOne({ phone });
  let otp;

  // Reuse OTP if within 5 minutes
  if (otpDoc && now - otpDoc.createdAt < OTP_VALIDITY_MS) {
    otp = otpDoc.otp;
  } else {
    //  Generate new OTP
    otp = Math.floor(1000 + Math.random() * 9000);

    await Otp.findOneAndUpdate(
      { phone },
      { otp, createdAt: now },
      { upsert: true, new: true }
    );
  }

  let channel = 'sms';

  try {
    if (forceSms === true) {
      await sendOtpSmsInternal(phone, otp);
      channel = 'sms';
    } else {
      await sendWATemplateMessage(phone, otp);
      channel = 'whatsapp';
    }
  } catch (err) {
    if (err.code === 'NOT_WHATSAPP') {
      await sendOtpSmsInternal(phone, otp);
      channel = 'sms';
    } else {
      return res.status(500).json({
        error: 'OTP delivery failed'
      });
    }
  }

  return res.status(200).json({
    message: 'OTP sent successfully',
    channel,
    reused: !!(otpDoc && now - otpDoc.createdAt < OTP_VALIDITY_MS)
  });
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
  sendOtp,
  verifyOtp,
  otpVerifiedStatus
};
