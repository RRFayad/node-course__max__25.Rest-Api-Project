exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: "First Post", content: "This is the first post!" }],
  });
};

exports.postCreatePost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  res.status(201).json({
    // 201 means success a resource was created (a bit more specific than just 200)
    message: "Post created successfully!",
    post: { id: new Date().toISOString(), title, content },
  });
};
