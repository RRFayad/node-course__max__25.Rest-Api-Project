const fs = require("fs");
const path = require("path");

const { validationResult, Result } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2; //this is not ideal, we are hard coding it here and in the front end
  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Fetched posts successfully", posts, totalItems });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No Image Provided!");
    error.statusCode = 422;
    throw error;
  }

  const userId = req.userId;
  const imageUrl = req.file.path.replace("\\", "/"); // Multer generates the path (as it was stored in the server - from my destination field when setting multer fileStorage)
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title,
    content,
    imageUrl,
    creator: userId,
  });
  post
    .save()
    .then((result) => {
      // Just to remember, the mongoose promise (cursor actually) returns the saved object
      return User.findById(userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      user.save();
    })
    .then((result) => {
      res.status(201).json({
        // 201 means success a resource was created (a bit more specific than just 200)
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No image file");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Post Updated", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not Authorized");
        error.statusCode = 403;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId); // We could just use this, but we will add later an user authentication, then we will need the whole logic
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId); // pull is a mongoose method to delete from an array a document with the ObjectId arg
      return user.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted post" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
