const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);

router.post(
  "/post",
  [
    body("title")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Minimum of 5 characters on Title"),
    body("content").isLength({ min: 5 }).withMessage("Content - Min 5"),
  ],
  feedController.postCreatePost
);

router.get("/post:postId", feedController.getPost);

module.exports = router;
