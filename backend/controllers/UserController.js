const User = require("../models/User");
const { INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_USER, USER_NOT_FOUND, USER_FETCH_SUCCESS } = require("../utils/stringConstants");

// Get list of users for creating asset
const getUserList = async (_req, res) => {
    try {
        const getUsers = await User.find().select('name email');
        if (!getUsers) {
            return res.status(404).json({ message: USER_NOT_FOUND });
        }
        res.status(200).json({ message: USER_FETCH_SUCCESS, data: getUsers });
    } catch (err) {
        console.error(INTERNAL_SERVER_ERROR_USER, err);
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
}

module.exports = getUserList;