const mongoose = require("mongoose");
const Schema = mongosse.Schema();

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true } // mongoose will automatically have a createdAt and updatedAt timestamp
);

module.exports = mongoose.model("Post", postSchema);
