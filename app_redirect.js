// Import the required modules
const express = require('express');

// Create an instance of the Express application
const app = express();


// Define the port to listen on
const port = 8081;

app.use((req, res, next) => {
  console.log("hitting normal http");
  if (req.headers.origin !== 'https://officialdaniel.com') {
    console.log("not https!!! redirecting...")
    res.redirect('https://officialdaniel.com');
  } else {
    next();
  }
});

// Define a route that responds to a GET request on the root URL
app.get('/', (req, res) => {
  res.send('Hello, Daniel!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});