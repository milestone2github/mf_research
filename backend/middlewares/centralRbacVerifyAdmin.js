const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: 'Not authorized, session not found' });
        }

        const user = req.session.user;

        console.log("Session user in verifyAdmin:", user);

        if (user.internalDashboardRole === 'Admin' || user.internalDashboardRole === 'Super Admin') {
            next();
        } else {
            return res.status(403).json({ message: 'Not authorized, admin or superAdmin role required' });
        }
    } catch (error) {
        console.error('Error in verifyAdmin middleware:', error);
        return res.status(500).json({ message: 'Server error during authorization' });
    }
};


module.exports = verifyAdmin;
