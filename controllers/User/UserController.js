const db = require("../../db");
const bcrypt = require("bcrypt");
const passport = require("passport");
const JWT = require("jsonwebtoken");
require("../../middlewares/passport")(passport);

require("dotenv").config();

let {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  // @ts-ignore
} = require("express-http-response");
const NotFoundResponse = require("express-http-response/lib/http/NotFoundResponse");

// @ts-ignore
const createUser = async (req, res, next) => {
  const {
    username,
    password,
    allowRead,
    allowCreate,
    allowUpdate,
    allowDelete,
  } = req.body.user || req.body;
  if (
    !username ||
    !password ||
    !validateBool(allowCreate) ||
    !validateBool(allowRead) ||
    !validateBool(allowUpdate) ||
    !validateBool(allowDelete)
  ) {
    return next(
      // @ts-ignore
      new BadRequestResponse("Please correctly fill all the fields ", 400),
    );
  }

  db.query(
    `select * from users where username = '${username}'`,
    async (err, result) => {
      if (err) {
        // @ts-ignore
        return next(new BadRequestResponse(err, 400));
      }
      if (result.length) {
        // @ts-ignore
        return next(new BadRequestResponse("User already exists", 409));
      }
      const hashedPassword = await hashPassword(password);
      const user = {
        username,
        password: hashedPassword,
        isActive: 1,
        isDeleted: 0,
        userType: "AdminUser",
      };
      db.query("INSERT INTO users SET ?", user, (err, result) => {
        if (err) {
          // @ts-ignore
          return next(new BadRequestResponse(err, 400));
        }
        db.query(
          `insert into permissions (userId, allowRead, allowCreate, allowUpdate, allowDelete) values (${result.insertId},${allowRead},${allowCreate},${allowUpdate},${allowDelete})`,
          (err, result) => {
            if (err) {
              // @ts-ignore
              return next(new BadRequestResponse(err, 400));
            }
            return next(new OkResponse("User has been created", 200));
          },
        );
      });
    },
  );
};

const login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      console.log(user, err, info);
      if (err) {
        // @ts-ignore
        next(new BadRequestResponse(err, 400));
      }
      if (!user) {
        console.log("User not found");
        // @ts-ignore
        next(new UnauthorizedResponse(info.message, 401));
      } else {
        const token = generateToken(user.username, user.password);
        delete user.password;

        // @ts-ignore
        next(new OkResponse({ ...user, token: token }, 200));
      }
    },
  )(req, res, next);
};

// @ts-ignore
const updateUser = (req, res, next) => {
  const {
    username,
    password,
    allowRead,
    allowCreate,
    allowUpdate,
    allowDelete,
  } = req.body.user || req.body;
  const { id } = req.params;
  if (
    !username ||
    !password ||
    !validateBool(allowCreate) ||
    !validateBool(allowRead) ||
    !validateBool(allowUpdate) ||
    !validateBool(allowDelete)
  ) {
    return next(new BadRequestResponse("Please fill all the fields", 400));
  }
  if (!id) {
    // @ts-ignore
    return next(new BadRequestResponse("Please provide user id", 400));
  }
  // @ts-ignore
  db.query(`select * from users where id= '${id}'`, async (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    if (result.length == 0) {
      return next(
        // @ts-ignore
        new NotFoundResponse("No user found against the given Id", 409),
      );
    }
    if (result.length) {
      if (result[0].userType === "SuperAdmin") {
        // @ts-ignore
        return next(
          // @ts-ignore
          new BadRequestResponse("You cannot update SuperAdmin", 400),
        );
      }
      const hashedPassword = await hashPassword(password);
      const user = {
        username,
        password: hashedPassword,
        isActive: 1,
        isDeleted: 0,
        userType: "AdminUser",
      };
      db.query(`update users set ? where id=${id}`, user, (err, result) => {
        if (err) {
          // @ts-ignore
          return next(new BadRequestResponse(err, 400));
        }
        db.query(
          `update permissions set allowRead=${allowRead},allowCreate=${allowCreate},allowUpdate=${allowUpdate},allowDelete=${allowDelete} where userId=${id}`,
          (err, result) => {
            if (err) {
              // @ts-ignore
              return next(new BadRequestResponse(err, 400));
            }
            // @ts-ignore
            return next(new OkResponse("User has been updated", 200));
          },
        );
      });
    }
  });
};

// @ts-ignore
const deleteUser = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    // @ts-ignore
    return next(new BadRequestResponse("Please provide user id", 400));
  }
  db.query(`SELECT * FROM users WHERE id = '${id}'`, async (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse("Something went wrong", 400));
    }
    console.log(result);
    if (result.length == 0) {
      return next(
        // @ts-ignore
        new BadRequestResponse("No user found against the given Id", 400),
      );
    }

    if (result.length > 0) {
      console.log(result[0].userType);
      if (result[0].userType === "SuperAdmin") {
        return next(
          // @ts-ignore
          new BadRequestResponse("You cannot delete SuperAdmin", 400),
        );
      }
      const query = `UPDATE users SET isDeleted = 1, isActive=0 WHERE id = '${id}'`;
      console.log(query);
      // @ts-ignore
      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          // @ts-ignore
          return next(new BadRequestResponse(err, 400));
        }
        // @ts-ignore
        return next(new OkResponse("User deleted successfully", 200));
      });
    }
  });
};

// @ts-ignore
const getAll = (req, res, next) => {
  const query = `SELECT * FROM users where isActive=1 and isDeleted=0`;
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      // @ts-ignore
      return next(new BadRequestResponse(err, 400));
    }
    if (result.length > 0) {
      for (let user of result) {
        delete user.password;
      }
    }
    // @ts-ignore
    return next(new OkResponse(result, 200));
  });
};

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.toString(), salt);
    console.log(hashedPassword);
    return hashedPassword;
  } catch (err) {
    return err;
  }
};

const validateBool = (value) => {
  if (value === 0 || value === 1) {
    return true;
  }
  return false;
};

const generateToken = (username, password) => {
  // @ts-ignore
  return JWT.sign({ username, password }, process.env.JWT_SECRET);
};

module.exports = {
  login,
  createUser,
  deleteUser,
  updateUser,
  getAll,
};
