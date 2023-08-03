const express = require('express');
const app = express();
const port = 8080;

app.use(express.static('home'));

// Middleware to log the client IP
app.use((req, res, next) => {
    console.log(`Request from IP: ${req.ip}`);
    next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));