const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded());    // This is what we used before, to get data from forms (x-www-form-urlencoded)
app.use(bodyParser.json()); // applicatoin/json
app.use("/images", express.static(path.join(__dirname, "images"))); // This is only for serving our images to the front end

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

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message; // this property exists by default
  res.status(status).json({ message });
});

mongoose
  .set("strictQuery", true)
  .connect(
    `mongodb+srv://test-user__node-course:${process.env.MONGODB_PASSWORD}@cluster0.comn0rn.mongodb.net/REST__API--messages`
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => console.log(err));
