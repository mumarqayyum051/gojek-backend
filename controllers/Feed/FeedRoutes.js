const express = require("express");
const router = express.Router();

const auth = require("../auth");

const {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
} = require("./FeedController");

router.post("/createPost", auth.requird, auth.createPermission, createPost);
router.delete(
  "/deletePost/:id",
  auth.requird,
  auth.deletePermission,
  deletePost,
);
router.put("/updatePost/:id", auth.requird, auth.updatePermission, updatePost);
router.get("/getAllPosts", auth.requird, auth.readPermission, getAllPosts);

module.exports = router;
