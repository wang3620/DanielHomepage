const express = require('express');
const app = express();
const port = 8080;

app.use(express.static('home'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));