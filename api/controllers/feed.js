const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "0001",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/budapest.jpg",
        creator: {
          name: "Renan",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postCreatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation Failed", errors: errors.array() });
  }

  const title = req.body.title;
  const content = req.body.content;
  // Create post in db

  res.status(201).json({
    // 201 means success a resource was created (a bit more specific than just 200)
    message: "Post created successfully!",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: "Renan" },
      createdAt: new Date(),
    },
  });
};
