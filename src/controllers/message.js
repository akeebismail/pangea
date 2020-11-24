const {sub, pub} = require('../services')
const axios = require('axios')
exports.subscribeMessage = async (req, res) => {
    const {topic} = req.params

    const {url} = req.body
    try {
        const onError = e => {
            console.log(e)
        }

        const publisher = await pub({onError})

        await publisher.start();
         await publisher.publish(topic, JSON.stringify({url}))
        //await publisher.close()
        return res.status(200).send({
            status: true,
            message: 'Topic successfully subscribed.',
            data: {topic, url}
        })
    }catch (e) {
        console.log(e)
        return res.status(500).send({
            status: false,
            message: 'Something went wrong.'
        })

    }
}

exports.publishMessage = async (req, res) => {
    const {topic} = req.params
    const {message} = req.body
    try {
        const onError = e => {
            console.log(e)
        }
        const subscriber = await sub({routingKeys: [topic], onError})
        subscriber.start(msg => {
            console.log(msg.content.toString())
            const request = axios.create({headers: {Accept: 'application/json', 'Content-Type': 'application/json'}})
            const m = msg.content.toString();
            let publishResponse
            const content = JSON.parse(m)
            if (Array.isArray(content)) {
                let sends = content.url.map(u => request.post(u, {message}))
                 publishResponse = axios.all(sends).then(responses => {
                    responses.map(result => console.log(result.data))
                    subscriber.ack(msg)
                    subscriber.close()
                })
                console.log(publishResponse)
            } else {
                publishResponse = request.post(content.url, {message}).then(({data}) => console.log(data)).catch(console.log)
                console.log(publishResponse);
                subscriber.ack(msg)
                subscriber.close();
            }

            return res.status(200).send({
                status: true,
                message: 'Message published successfully.',
                data: {
                    message, url: content.url, publishResponse
                }
            })
        })
    }catch (e) {
        console.log(e)
        return res.status(500).send({
            status: false,
            message: 'Something went wrong.'
        })
    }
}

exports.event = (req, res) => {
    return res.status(200).send({
        status: true,
        message: 'Message received successfully',
        data: req.body
    })
}