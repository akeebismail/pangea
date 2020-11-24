const express = require('express')
const messageController = require('../controllers/message')
const router = express.Router()
const validate = require('../middleware/validate')
const {subscribe, publish} = require('../validations/message')
router.post('/subscribe/:topic', validate(subscribe), messageController.subscribeMessage)
router.post('/publish/:topic', validate(publish), messageController.publishMessage)
router.post('/event', messageController.event)
module.exports = router