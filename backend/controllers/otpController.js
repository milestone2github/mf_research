
const OtpWati = require("../models/OtpWati");
const { FE } = require("../models/RouteOptimization");
const sendWATemplateMessage = require("../utils/sendWATemplateMessage");

// Generate a 6-digit random OTP
const generateOTP = () =>
	Math.floor(100000 + Math.random() * 900000).toString();

// Controller function
const sendOtpViaWhatsApp = async (req, res) => {
	try {
		const phone = req.contactNumber;
		const employeeId = req.employeeId;
		if (!phone || !employeeId) {
			return res.status(400).json({ error: "Phone number and Employee Id is required" });
		}

		// Find Field Executive (FE) by phone number
		const fe = await FE.findOne({ contactNumber, employeeId });
		if (!fe) {
			return res.status(404).json({ error: "Field Executive not found." });
		}

		// Check status (references the 'status')
		if (fe.status.toLowerCase() !== "active") {
			console.log(
				`Error in Sending OTP via WhatsApp.\nUser: ${fe.name} having employeeId: ${fe.employeeId} is ${fe.status}`
			); // debug
			return res.status(403).json({ error: `User is ${user.status}` });
		}

		const otpCode = generateOTP();

		// Save OTP instance to DB (auto-expires in 5 minutes)
		await OtpWati.create({ phone, otp: otpCode });

		// send OTP via whatsapp
		const sentWhatsAppMessage = await sendWATemplateMessage(phone, otpCode);

		if (!sentWhatsAppMessage) {
			return res.status(500).json({ error: "Failed to send WhatsApp message" });
		}

		return res
			.status(200)
			.json({ message: "OTP sent successfully via WhatsApp" });
	} catch (error) {
		console.error("Error sending WhatsApp message:", error);
		return res
			.status(500)
			.json({ error: error.message || "Unknown error occurred" });
	}
};

// Verify Sent OTP
const verifyOtpWati = async (req, res) => {
	try {
		const { otp } = req.body;
		const phone = req.contactNumber;

    if (!phone) {
      return res.status(400).json({ error: "Valid Phone Number not provided" });
    } else if (!otp) {
      return res.status(400).json({ error: "Valid OTP is required" });
    }

		// Find the most recent OTP for the phone
		const existingOtp = await OtpWati.findOne({ phone, otp });

		if (!existingOtp) {
			return res.status(400).json({ error: "Invalid or expired OTP" });
		}

		// OTP is valid; delete it (optional)
		await OtpWati.deleteOne({ _id: existingOtp._id });

		res.status(200).json({ message: "OTP verified successfully" });
	} catch (error) {
		console.error("OTP verification failed:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	sendOtpViaWhatsApp,
	verifyOtpWati,
};
