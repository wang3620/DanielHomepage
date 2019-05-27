const express = require('express');
const fs = require('fs');
const https = require('https')
const app = express();
const port = 8080;

app.use(express.static('home'));

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(port, function () {
        console.log('Example app listening on port 3000! Go to https://localhost:8080/')
    });