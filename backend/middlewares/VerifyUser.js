const User = require("../models/User");
const getCombinedPermissions = require("../utils/getCombinedPermissions");

const verifyUser = async (req, res, next) => {
  // console.log("SESSION INFO: ", req.session);   // debug
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User is not logged in" });
  }
  
  try {
    const user = await User.findOne({email: req.session.user.email}).populate('role').lean();
    // console.log("USER INFO: ==> ", user);   // debug
    if(!user) {
      return res.status(401).json({error: 'User not found'})
    }
    const permissions = await getCombinedPermissions(user);

    req.user = {...user, name: req.session.user.name , permissions}

   // Update session so permissions are cached
    req.session.user.permissions = permissions;

    next()
  } catch (error) {
    console.error('Error verifying user: ', error.message)
    return res.status(500).json({error: 'Error verifying user'})
  }
}

module.exports = verifyUser