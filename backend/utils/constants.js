const WA_WATI_URL = (whatsappNumber) =>
	`https://live-mt-server.wati.io/302180/api/v1/sendTemplateMessage?whatsappNumber=${whatsappNumber}`;

const baseLocation = [77.1091912, 28.7193204];  // Base Location (Long, Lat) --> to be set-on new record creation

module.exports = {
  WA_WATI_URL,
  baseLocation
}