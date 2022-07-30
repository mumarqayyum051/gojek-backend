const express = require("express");
const router = express.Router();

const {
  createUser,
  deleteUser,
  updateUser,
  login,
  getAll,
} = require("./UserController");

router.post("/create", createUser);
router.post("/login", login);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/getAll", getAll);

module.exports = router;
