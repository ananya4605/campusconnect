const mongoose = require("mongoose");

const CATEGORIES = [
  "Internships",
  "Events",
  "Study Materials",
  "Announcements",
  "Lost & Found",
];

const isEmailOrEmpty = [
  (v) => !v || /^\S+@\S+\.\S+$/.test(v),
  "Contact email is not valid",
];

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 4000,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: { values: CATEGORIES, message: "Please pick a valid category" },
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: isEmailOrEmpty,
    },
    applyLink: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
module.exports.CATEGORIES = CATEGORIES;
