require('dotenv').config()
module.exports = {
    amqURL: process.env.AMQ_URL || 'amqp://localhost',
    qName: 'pangaeaExchange',
    exchange: 'pangaeaMessage',
    type: 'topic'
}