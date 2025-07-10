const {postMessageData} = require('../controllers/ChatBotController');
const router = require('express').Router();
router.post("/",  postMessageData);

module.exports = router;