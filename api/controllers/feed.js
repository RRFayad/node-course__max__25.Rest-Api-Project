const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "Fetched posts successfully",
        posts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postCreatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl: "images/budapest.jpg",
    creator: { name: "Renan" },
  });
  post
    .save()
    .then((result) => {
      // Just to remember, the mongoose promise (cursor actually) returns the saved object
      res.status(201).json({
        // 201 means success a resource was created (a bit more specific than just 200)
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); // As we are inside a async code snippet, throwing the error will not work, we must call next() to reach the next middleware for error handling
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; // Here we throw the error, as it will be passed to the next catch block
      }
      res.status(200).json({ message: "Post Fetched", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
