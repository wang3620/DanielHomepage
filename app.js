const express = require('express');
const app = express();
const port = 8080;
const ipInfo = require("ip-info-finder");

app.use(express.static('home'));

// Middleware to log the client IP
app.use((req, res, next) => {
    console.log(`Request from IP: ${req.ip}`);
    const realIP = req.ip.split(':')[req.ip.split(':').length - 1];
    ipInfo.getIPInfo(
        realIP
    ).then(data => {
        console.log("find ip info!!!!")
        console.log(data);
    })
        .catch(err => console.log(err));
    next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));