const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  console.log(req.body);
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email,
        password: hashedPw,
        name,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "User Created!",
        userId: result._id,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let userData;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error("E-mail not found");
        error.statusCode = 401;
        throw error;
      }
      userData = user;
      return bcrypt.compare(password, userData.password);
    })
    .then((passwordDoesMatch) => {
      if (!passwordDoesMatch) {
        const error = new Error("Password does not match!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: userData.email,
          userId: userData._id.toString(),
        },
        "secret", // This is a random word I choose as the developer, to combine with the token to add more secutiry (the longer the string, more secure)
        { expiresIn: "1h" }
      );
      res.status(200).json({ token, userId: userData._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
