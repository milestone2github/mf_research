// Checks for active field executives and returns the ObjectId if true

const { FE } = require("../models/RouteOptimization");

const feStatusCheck = async (req, res, next) => {
  try {
    const contactNumber = req.contactNumber;
    const empId = req.employeeId;

    if (!contactNumber || !empId) {
      res.status(404).json({ error: "Contact Number or Employee Id not found" });
    }

    // Check for existing record in FE schema
    const fe = await FE.findOne({
      contactNumber,
      employeeId: empId,
      status: "ACTIVE",
    });
    if (!fe) {
      return res.status(404).json({ info: "Active FE not found" });
    }

    // Put the Object Id in custom req field
    req.feId = fe._id;
    next();
  } catch (err) {
		console.error("Unable to verify the Field Executive Status:", err.message);
		return res.status(403).json({ error: "Forbidden" });
	}
}

module.exports = { feStatusCheck }