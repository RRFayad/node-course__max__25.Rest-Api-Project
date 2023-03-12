const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded());    // This is what we used before, to get data from forms (x-www-form-urlencoded)
app.use(bodyParser.json()); // applicatoin/json

app.use((req, res, next) => {
  // Before we send to our routes, we want to set headers to our response (to prevent CORS errors)
  res.setHeader("Access-Control-Allow-Origin", "*"); // We are allowing all URL's to interact with our API, we could specify some
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  ); // We are allowing all these methods in the requests
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // We are allowing theses headers in the requests
  next(); //  Obviously, we are moving to our nextg middleware
});

app.use("/feed", feedRoutes);

app.listen(8080);
