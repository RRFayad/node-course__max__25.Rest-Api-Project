const express = require("express");

const router = express.Router();

router.put("/signup"); // Here we are using put, as the user is created only once, it will be created or edited

module.exports = router;
