const Department = require("../../models/Department");
const User = require("../../models/User");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[a-zA-Z\s]+$/;

// Fetch all users / also used to get admins
const getAllUsers = async (req, res) => {
    try {
        const { email, department, search, isAdminOnly  } = req.query;
        let query = {};
        let departmentId;
        let message = "";


         // 🔍 Search by name/email (if provided)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Email filter
        if (email) {
            const regex = new RegExp(`@${email}$`, "i");
            query.email = regex;
        }

        // Department filter
        if (department) {
            const deptDoc = await Department.findOne({ name: department });
            
            if (!deptDoc) {
                return res.status(404).json({
                    success: false,
                    message: "No such department found",
                    data: []
                });
            }
            query.department = deptDoc._id;
        }

        // 🔑 Admin filter
        if (isAdminOnly === "true") {
            query.internalDashboardRole = { $in: ["Admin", "Super Admin"] };
        }

        const users = await User.find(query).populate("department role permissions");

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found matching the provided criteria",
                data: []
            });
        }
        // 📝 Decide message ,as i used these in toast
        if (search) {
            message = "User's Found";
        } else if (email) {
            message = "Users filtered by Email";
        } else if (department) {
            message = "Users filtered by Department";
        } else if (isAdminOnly === "true") {
            message = "Admins fetched successfully";
        } else {
            message = "All users fetched";
        }

        res.status(200).json({
            success: true,
            message,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching users",
            error: error.message
        });
    }
};

// Fetch user by id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("department role permissions");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user", error });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const { name, email, department, role, customRole, mintUsername, insuranceDashboardID, permissions } = req.body;

        if (!name || !email || !department || !role) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User with this email already exists" });
        }

        if (!nameRegex.test(name)) {
            return res.status(400).json({ success: false, message: "Invalid name format" });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (mintUsername && !usernameRegex.test(mintUsername)) {
            return res.status(400).json({ success: false, message: "Invalid username format (3-20 alphanumeric characters)" });
        }

        const newUser = new User({
            name,
            email,
            department,
            role,
            customRole,
            mintUsername,
            insuranceDashboardID,
            permissions: permissions || []
        });

        await newUser.save();

        res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating user', error });
    }
};

// Update existing user
const updateUser = async (req, res) => {
    try {
        const { department, role, status, mintUsername, insuranceDashboardID, folderId, permissions } = req.body;

        if (mintUsername && !usernameRegex.test(mintUsername)) {
            return res.status(400).json({ success: false, message: "Invalid username format (3-20 alphanumeric characters)" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { department, role, status, mintUsername, insuranceDashboardID, folderId, permissions },
            { new: true, runValidators: true }
        ).populate("department role permissions");

        if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error });
    }
};

// Delete user data
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting user", error });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
