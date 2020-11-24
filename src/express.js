const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const route = require('./routes')
const app = express();
app.use(bodyParser.json())
app.post('/test', (req, res) => {
})
app.get('/', (req, res) => {
    res.send('ok')
})
app.use(route)
http.createServer(app).listen(8000,  () => {
    console.log('http running on 5000...')
});


