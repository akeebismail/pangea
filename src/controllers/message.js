const {sub, pub} = require('../services')
const axios = require('axios')
exports.subscribeMessage = async (req, res) => {
    const {topic} = req.params

    const {url} = req.body
    try {

        const publisher = await pub({})
        console.log(topic, url)
        await publisher.start();
        await publisher.publish(topic, JSON.stringify({url}))
        await publisher.close()
        return res.send('topic subscribed')
    }catch (e) {
        console.log(e)
        return res.send('error subscribing to ' + topic)
    }
}

exports.publishMessage = async (req, res) => {
    const {topic} = req.params
    const {message} = req.body
    try {
        console.log(message, topic)
        const subscriber = await sub({routingKeys: [topic]})
        subscriber.start(msg => {
            console.log('starting subs...')
            console.log(msg.content.toString())
            const request = axios.create({headers: {Accept: 'application/json', 'Content-Type': 'application/json'}})
            const m = msg.content.toString();

            /*let sends = m.url.map(u => request.post(u, {message}))
            const publishResponse = axios.all(sends).then(responses => {
                responses.map(result => console.log(result.data))
                subscriber.close();
            })
            console.log(publishResponse)*/
            subscriber.close()
            return res.send(m)
        })
        console.log('sent sub')
    }catch (e) {
        console.log(e)

        return res.send('something went')
    }
}