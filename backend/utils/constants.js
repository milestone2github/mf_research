const WA_WATI_URL = (whatsappNumber) =>
	`https://live-mt-server.wati.io/302180/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`;

module.exports = { WA_WATI_URL }