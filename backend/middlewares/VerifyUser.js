const verifyUser = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "User is not logged in" });
  }

  req.user = req.session.user
  next()
}

module.exports = verifyUser