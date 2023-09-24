const express = require('express');
const mariadb = require('mariadb');
const https = require('https');
const fs = require('fs');
const { createClient } = require('redis');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'daniel',
  password: '7777',
  database: 'danielHomepage',
  connectionLimit: 100
});
const app = express();
const port = 8080;

let privateKey;
let certificate;
let bundle;

if (process.env.ENV === 'local') {
  privateKey = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.ca-bundle');
} else {
  privateKey = fs.readFileSync('/home/pi/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.ca-bundle');
}

https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
      ca: bundle
    },
    app
  )
  .listen(port);

const ipInfo = require('ipinfo');

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
      latitude: null
    };
    console.log('realIpInfo is the following:');
    console.log(realIpInfo);
    if (realIpInfo.loc) {
      const arr = realIpInfo.loc.split(',');
      const log = arr[1];
      const lat = arr[0];
      location.longitude = log;
      location.latitude = lat;
    }
    if (location.longitude && location.latitude) {
      const raw_headers = req.rawHeaders.join(',');
      const redisClient = await createClient()
        .on('error', (err) => console.log('Redis Client Error', err))
        .connect();
      await redisClient.lPush('locations', JSON.stringify(location));
      await redisClient.lTrim('locations', 0, 999);
      const res = await conn.query(
        'INSERT INTO ip_location_history (location, raw_headers) values (?, ?)',
        [location, raw_headers]
      );
      console.log(res);
    }
  } catch (err) {
    console.log('get err');
    console.log(err);
  } finally {
    next();
  }
});

app.get('/ip_location_history', async (req, res) => {
  let conn;
  let result = [];
  let resultLimit = 30;
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const query = req.query.type;
    if (query === 'mysql') {
      conn = await pool.getConnection();
      const queryResult = await conn.query(
        `SELECT location FROM ip_location_history order by created_at desc limit ${resultLimit};`
      );
      for (let i = 0; i < queryResult.length; i += 1) {
        const obj = queryResult[i];
        const locationStr = obj.location;
        const location = JSON.parse(locationStr);
        if (location.longitude && location.latitude) {
          result.push([parseFloat(location.longitude, 10), parseFloat(location.latitude, 10), 1]);
        }
      }
    } else if (query === 'redis') {
      const redisClient = await createClient()
        .on('error', (err) => console.log('Redis Client Error', err))
        .connect();
      const resRedis = await redisClient.lRange('locations', 0, resultLimit);
      const convertedResult = resRedis.map((element) => JSON.parse(element));
      result = [...convertedResult];
    } else {
      res.status(400).send('your type in query parameter is invalid');
      return;
    }
    res.send(result);
  } catch (err) {
    console.log('error during get ip_location_history');
    console.log(res);
    res.status(500).send('Internal Server Error');
  }
});
