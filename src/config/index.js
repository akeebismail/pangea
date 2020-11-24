require('dotenv').config()
module.exports = {
    mongoURL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/pangea',
    amqURL: process.env.AMQ_URL,
    qName: 'pangeaExchange',
    exchange: 'pangeaMessage',
    type: 'topic'
}