const sendEmail = require("../utils/sendEmail")

const sendEmailController = async (req, res) => {
  console.log('recieved...')
  console.log(req.session.user) //test
  if(!req.session?.user) {
    return res.status(401).json({error: 'Unauthorized request'})
  }
  const {subject, body, toAddress, ccAddress} = req.body
  
  if(!subject || !toAddress) {
    return res.status(400).json({error: 'Email subject and to address are required'})
  }
  const messageId = await sendEmail(subject, body, toAddress, ccAddress)
  if(!messageId) {
    return res.status(500).json({error: 'Unable to send Email'})
  }
  res.status(200).json({message: 'Email sent', data: messageId})
}

module.exports = {sendEmailController}