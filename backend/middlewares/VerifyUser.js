const User = require("../models/User");

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
    req.user = {...user, name: req.session.user.name}
    next()
  } catch (error) {
    console.error('Error verifying user: ', error.message)
    return res.status(500).json({error: 'Error verifying user'})
  }
}

module.exports = verifyUser