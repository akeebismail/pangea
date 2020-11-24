const amqp = require('amqplib')
const config = require('../config')
const {
    QUEUE_NOT_STARTED,
    QUEUE_ALREADY_STARTED,
    NOT_CONNECTED
} = require('./errors')
const attachEvents = require('./attachEvents')

/**
 * Create a publisher with the given options.
 * @param options
 *   - onError a handler to handle connection errors (optional)
 *   - onClose a handler to handle connection closed events (optional)
 * @return A Publisher
 */
const publisher = options => {

    const {  onError, onClose } = options
    let connection
    let channel

    const start = async () => {
        if (channel) throw new Error(QUEUE_ALREADY_STARTED)
        connection = await amqp.connect(config.amqURL)
        attachEvents(connection, { onError, onClose })

        channel = await connection.createChannel()
        await channel.assertExchange(config.exchange, config.type, { durable: true })
    }

    const stop = async () => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        await channel.close()
        channel = undefined
    }

    const publish = async (key, message) => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        const buffer = Buffer.from(message)
        return channel.publish(config.exchange, key, buffer)
    }

    const close = async () => {
        if (!connection) throw new Error(NOT_CONNECTED)
        await connection.close()
        channel = undefined
        connection = undefined
    }

    return { start, stop, publish, close }
}

module.exports = publisher
