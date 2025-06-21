const Department = require("../../models/Department");
const User = require("../../models/User");


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const nameRegex = /^[a-zA-Z\s]+$/;

// Fetch all users
const getAllUsers = async (req, res) => {
    try {
        const { email, department } = req.query;
        let filter = {};
        let departmentId;

        // Email filter
        if (email) {
            const regex = new RegExp(`@${email}$`, "i");
            filter.email = regex;
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
            filter.department = deptDoc._id;
        }
        
        const users = await User.find(filter).populate("department role permissions");

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found matching the provided criteria",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: email || department
                ? "Filtered users fetched successfully"
                : "All users fetched successfully",
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
        const { department, role, emp_status, mintUsername, insuranceDashboardID, permissions } = req.body;

        if (mintUsername && !usernameRegex.test(mintUsername)) {
            return res.status(400).json({ success: false, message: "Invalid username format (3-20 alphanumeric characters)" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { department, role, emp_status, mintUsername, insuranceDashboardID, permissions },
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

const searchByNameOrEmail = async (req, res) => {
    try {
        const { search, isAdminOnly } = req.query;
        const query = {};

        if (!search) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];

        if (isAdminOnly === 'true') {
            query.internalDashboardRole = { $in: ['Admin', 'Super Admin'] };
        }

        const users = await User.find(query).populate("department role");

        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No users found with this name or email",
                data: []
            });
        }
        

        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error searching users:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};



module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, searchByNameOrEmail };
