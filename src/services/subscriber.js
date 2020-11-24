const amqp = require('amqplib')
const config = require('../config')
const {
    QUEUE_NOT_STARTED,
    QUEUE_ALREADY_STARTED,
    NOT_CONNECTED
} = require('./errors')
const attachEvents = require('./attachEvents')

/**
 * Create a Subscriber with the given options.
 * @param options
 *   - routingKeys An array of keys to use for message handler routing (optional, defaults to [queueName])
 *   - onError a handler to handle connection errors (optional)
 *   - onClose a handler to handle connection closed events (optional)
 * @return A Subscriber
 */
const subscriber = options => {
    const {routingKeys, onClose, onError } = options
    let connection
    let channel
    let queue
    const start = async handler => {
        if (channel) throw new Error(QUEUE_ALREADY_STARTED)
        connection = await amqp.connect(config.amqURL)
        attachEvents(connection, { onError, onClose })

        channel = await connection.createChannel()
        channel.assertExchange(config.exchange, config.type, { durable: true })
        const result = await channel.assertQueue(config.qName, { exclusive: false })
        ;({ queue } = result)
        const rKeys = routingKeys || [config.qName]
        rKeys.forEach(rKey => {
            channel.bindQueue(queue, config.exchange, rKey)
        })
        channel.prefetch(1)
        channel.consume(queue, handler)
    }

    const stop = async () => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        await channel.close()
        channel = undefined
    }

    const ack = message => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        channel.ack(message)
    }

    const nack = message => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        channel.nack(message)
    }

    const purgeQueue = async () => {
        if (!channel) throw new Error(QUEUE_NOT_STARTED)
        await channel.purgeQueue(queue)
    }

    const close = async () => {
        if (!connection) throw new Error(NOT_CONNECTED)
        await connection.close()
        channel = undefined
        connection = undefined
    }

    return { start, stop, ack, nack, purgeQueue, close }
}

module.exports = subscriber;
