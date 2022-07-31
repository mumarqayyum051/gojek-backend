const express = require("express");
const auth = require("../auth");
const router = express.Router();

const {
  createUser,
  deleteUser,
  updateUser,
  login,
  getAll,
  userContext,
} = require("./UserController");

router.post("/create", auth.required, auth.superAdmin, createUser);
router.post("/login", login);
router.put("/update/:id", auth.required, auth.superAdmin, updateUser);
router.delete("/delete/:id", auth.required, auth.superAdmin, deleteUser);
router.get("/getAll", auth.required, auth.superAdmin, getAll);
router.get("/context", auth.required, auth.user, userContext);

module.exports = router;
