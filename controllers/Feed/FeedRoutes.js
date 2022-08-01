const express = require("express");
const router = express.Router();

const auth = require("../auth");

const {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
} = require("./FeedController");

router.post("/createPost", auth.required, auth.postPermissions, createPost);
router.delete(
  "/deletePost/:id",
  auth.required,
  auth.postPermissions,
  deletePost,
);
router.put("/updatePost/:id", auth.required, auth.postPermissions, updatePost);
router.get("/getAllPosts", auth.required, auth.postPermissions, getAllPosts);

module.exports = router;
