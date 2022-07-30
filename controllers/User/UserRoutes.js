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

router.post("/create", auth.required, auth.createPermission, createUser);
router.post("/login", login);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/getAll", getAll);

module.exports = router;
