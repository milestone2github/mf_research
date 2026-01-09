const WA_WATI_URL = (whatsappNumber) =>
	`https://live-mt-server.wati.io/302180/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`;
const HR_NAME= "Ishika Raheja";

const baseLocation = [77.1092925, 28.7195327];  // Base Location (Long, Lat) --> to be set-on new record creation

module.exports = {
  WA_WATI_URL,
  baseLocation,
  HR_NAME
}