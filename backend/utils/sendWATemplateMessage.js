const axios = require("axios");
const { WA_WATI_URL } = require("./constants");

async function sendWATemplateMessage(whatsappNumber, otp) {
	if (!whatsappNumber) {
		throw new Error("Please provide a valid WhatsApp number");
	}

	// Add +91 if only 10 digits
	if (whatsappNumber.length === 10) {
		whatsappNumber = "+91" + whatsappNumber;
	}

	const url = WA_WATI_URL(whatsappNumber);

	const wati_token = process.env.WA_TOKEN;
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${wati_token}`,
	};

	const payload = {
		broadcast_name: process.env.WA_BROADCAST,
		parameters: [
			{
				name: "1",
				value: `${otp}`,
			},
		],
		template_name: "otp_send",
	};

	try {
		const response = await axios.post(url, payload, { headers });
		const responseData = response.data;

		if (!responseData.result) {
			throw new Error("Error sending WhatsApp message");
		}

		if (
			responseData.hasOwnProperty("validWhatsAppNumber") &&
			!responseData.validWhatsAppNumber
		) {
			throw new Error(
				`Provided WhatsApp number ${whatsappNumber} is not valid`
			);
		}

		return true;
	} catch (error) {
		console.log("error in WA: ", error);
		throw new Error(
			error.message || "Unknown error occurred while sending Whatsapp message"
		);
	}
}

module.exports = sendWATemplateMessage;
