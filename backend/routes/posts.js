const express = require("express");
const Post = require("../models/Post");
const asyncHandler = require("../middleware/asyncHandler");
const { protect } = require("../middleware/auth");

const router = express.Router();

const populateAuthor = { path: "author", select: "name" };
const SORT = "-createdAt";

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query, currentUserId) {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }
  if (query.mine === "true") filter.author = currentUserId;
  return filter;
}

function validateBody(body) {
  const errors = [];
  if (!body.title?.trim()) errors.push("Title is required");
  if (!body.description?.trim()) errors.push("Description is required");
  if (!Post.CATEGORIES.includes(body.category)) errors.push("Pick a valid category");
  if (body.contactEmail && !/^\S+@\S+\.\S+$/.test(body.contactEmail)) {
    errors.push("Contact email is not valid");
  }
  return errors;
}

function cleanBody(body) {
  return {
    title: body.title.trim(),
    description: body.description.trim(),
    category: body.category,
    contactEmail: body.contactEmail?.trim().toLowerCase() || "",
    applyLink: body.applyLink?.trim() || "",
  };
}

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const posts = await Post.find(buildFilter(req.query, req.user._id))
      .populate(populateAuthor)
      .sort(SORT);
    res.json({ count: posts.length, posts });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate(populateAuthor);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const errors = validateBody(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(". ") });

    const post = await Post.create({ ...cleanBody(req.body), author: req.user._id });
    res.status(201).json({ post: await Post.populate(post, populateAuthor) });
  })
);

router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const errors = validateBody(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join(". ") });

    Object.assign(post, cleanBody(req.body));
    await post.save();
    res.json({ post: await Post.populate(post, populateAuthor) });
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  })
);

module.exports = router;
