const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // this will contain userId, email, etc.
   
    // OTP verification check from session
    if (!req.session?.otpVerified) {
      return res.status(403).json({ error: ' ❌ OTP not verified. Access denied. ❌' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Verify JWT token from Headers to decode the contactNumber and employeeId
const verifyJWT = (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.contactNumber = decoded.contactNumber;
		req.employeeId = decoded.employeeId;
		next();
	} catch (err) {
		console.error("Unable to verify the JWT Token:", err.message);
		return res.status(403).json({ error: "Forbidden" });
	}
};

module.exports = { verifyToken, verifyJWT };
