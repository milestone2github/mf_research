const axios = require('axios')

const whiteListedIPs = ["59.144.175.136", "59.144.175.138", "122.173.24.80", "122.160.123.165"]

const getIpAddress = (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  if (!ip) {
    return res.status(404).json({ error: 'IP not found' })
  }

  const clientIp = ip.split(',')[0].trim();
  // console.log('client IP: ', clientIp)
  let existInWhite = whiteListedIPs.find((item) => item === clientIp)
  res.status(200).json({ message: 'Ip found', data: { ip: clientIp, allowed: existInWhite ? true : false } })
}

const getMintLoginUrl = async (req, res) => {
  const ip = req.body.ip || ''
  const otp = req.body.otp || ''

  const data = {
    username: req.user.mintUsername,
    email: req.user.email,
  };

  if (ip) { data.ip = ip; }
  if (otp) { data.otp = otp; }

  axios.post('https://milestone-api.azurewebsites.net/api/MintSignIn?', data, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': `bearer ${process.env.MINT_X_API_KEY}`
    }
  })
    .then(response => {
      res.status(200).json({ message: 'access retrieved', data: response.data })
    })
    .catch(error => {
      console.error('error status:', error.message);
      res.status(error.response?.status || 500).json({ error: error.response?.data || error.message })
    });
}

module.exports = { getIpAddress, getMintLoginUrl }
