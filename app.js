const express = require('express');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user:'daniel',
    password: '7777',
    database: "danielHomepage",
    connectionLimit: 5
});
const app = express();
const port = 8080;

const ipInfo = require("ipinfo")

app.use(express.static('home'));

// Middleware to log the client IP
app.use(async (req, res, next) => {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log(`Request from IP: ${req.ip}`);
        const realIP = req.ip.split(':')[req.ip.split(':').length - 1];
        const realIpInfo = await ipInfo(realIP);
        const location = {
            longitude: null,
            latitude: null,
        }
        if (realIpInfo.loc) {
            const arr = realIpInfo.loc.split(",");
            const log = arr[0];
            const lat = arr[1];
            location.longitude = log;
            location.latitude = lat;
        }
        const res = await conn.query("INSERT INTO ip_location_history (location) values (?)", [location]);
        console.log(res);

    } catch (err) {
        console.log("get err");
        console.log(err);
    } finally {
        next();
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));