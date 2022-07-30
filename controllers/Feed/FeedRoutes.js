const express = require("express");
const router = express.Router();

const auth = require("../auth");

const {
  createPost,
  deletePost,
  updatePost,
  getAllPosts,
} = require("./FeedController");

router.post("/createPost", auth.required, auth.createPermission, createPost);
router.delete(
  "/deletePost/:id",
  auth.required,
  auth.deletePermission,
  deletePost,
);
router.put("/updatePost/:id", auth.required, auth.updatePermission, updatePost);
router.get("/getAllPosts", auth.required, auth.readPermission, getAllPosts);

module.exports = router;
