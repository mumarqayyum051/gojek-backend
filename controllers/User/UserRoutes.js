const express = require("express");
const auth = require("../auth");
const router = express.Router();

const {
  createUser,
  deleteUser,
  updateUser,
  login,
  getAll,
} = require("./UserController");

router.post("/create", auth.required, auth.superAdmin, createUser);
router.post("/login", login);
router.put("/update/:id", auth.required, auth.updatePermission, updateUser);
router.delete("/delete/:id", auth.required, auth.deletePermission, deleteUser);
router.get("/getAll", getAll);

module.exports = router;
