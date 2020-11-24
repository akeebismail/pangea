const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')

const app = express();
app.use(bodyParser.json())
app.post('/event', (req, res) => {
    console.log(req.body)
    return res.send({message: 'Thank you', data: req.body})
})
app.post('/event/:event', (req, res) => {
    console.log(req.body)
    return res.status(200).json({message: 'Thank you', data: req.body})
})
app.get('/', (req, res) => {
    res.send('ok')
})
http.createServer(app).listen(4000, () => {
    console.log('http running on 5000...')
});


