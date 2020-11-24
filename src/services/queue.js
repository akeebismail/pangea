const amqp = require('amqplib')
const config = require('../config')
const {
    QUEUE_NOT_STARTED,
    QUEUE_ALREADY_STARTED,
    EXCHANGE_MISSING,
    QUEUE_MISSING,
    NOT_CONNECTED
} = require('./errors')

/**
 * Create a Subscriber with the given options.
 * @param options
 *   - exchange The name of the service exchange (required)
 *   - queueName The name of the AMQP queue to subscribe to. (required)
 *   - routingKeys An array of keys to use for message handler routing (optional, defaults to [queueName])
 *   - type The type of AMQP queue to use. Defaults to 'topic'
 *   - url The url of the AQMP server to use.  Defaults to 'amqp://localhost'
 *   - onError a hander to handle connection errors (optional)
 *   - onClose a handler to handle connection closed events (optional)
 * @return A Subscriber
 */
const makeSubscriber = (topic, body) => {

    let connection
    let channel
    let queue

    /**
     * @param handler A callback that takes a message param.
     *        The callback is invoked when a message is received.
     *
     * Example use
     * const subscriber = makeSubscriber({ exchange: 'test', queueName: 'test' })
     * const handler = message => {
     *   console.log('Message Received', message)
     *   subscriber.ack(message)
     * }
     * subscriber.start(handler)
     */
    const start = async handler => {
        if (channel) throw new Error(QUEUE_ALREADY_STARTED)
        connection = await amqp.connect(config.amqURL)
        //attachEvents(connection, { onError, onClose })

        channel = await connection.createChannel()
        channel.assertExchange('test', 'message', { durable: true })
        const result = await channel.assertQueue(topic, { exclusive: false });
        ({ queue } = result)
        const rKeys = [topic]
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

module.exports = makeSubscriber
