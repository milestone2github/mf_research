const User = require("../../models/User");

//get all user that are Admin/SuperAdmin
const getAdmin = async (req, res) => {
    try {
        const admins = await User.find({ internalDashboardRole: { $in: ['Admin', 'Super Admin'] } }).populate('role department');
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ success: false, message: 'Could not fetch Admins.' });
    }
};

// make user as Admin
// In your admin controller
const addAdmin = async (req, res) => {
    const userId = req.params.id;
    const role = 'Admin';

    if (!userId) {
        return res.status(400).json({ success: false, message: 'Please provide the userId to promote to Admin.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { internalDashboardRole: role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `User ${user.name} promoted to Admin successfully.`, 
            data: user 
        });
    } catch (error) {
        console.error('Error adding Admin:', error);
        res.status(500).json({ success: false, message: 'Could not add Admin.' });
    }
};

const removeAdmin = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { internalDashboardRole: '' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Admin user not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `Admin role removed from user ${user.name} successfully.`, 
            data: user 
        });
    } catch (error) {
        console.error('Error removing Admin:', error);
        res.status(500).json({ success: false, message: 'Could not remove Admin role.' });
    }
};


module.exports = { getAdmin, addAdmin, removeAdmin };