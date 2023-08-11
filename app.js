const express = require('express');
const db = require('./db')
const app = express();
const port = 8080;

const ipInfo = require("ipinfo")

app.use(express.static('home'));

// Middleware to log the client IP
app.use((req, res, next) => {
    console.log(`Request from IP: ${req.ip}`);
    const realIP = req.ip.split(':')[req.ip.split(':').length - 1];
    db.pool.query("select * from ip_location_history;").then(res => {
        console.log("get db query response");
        console.log(res);
    }).catch(err => {
        console.log("get db query err");
        console.log(err);
    })
    ipInfo(realIP, (err, cLoc) => {
        console.log(err || cLoc)
    })
    next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));