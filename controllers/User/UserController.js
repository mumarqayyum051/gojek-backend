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
} = require("express-http-response");

const createUser = async (req, res, next) => {
  const { username, password } = req.body.user || req.body;
  if (!username || !password) {
    return next("Please fill all the fields", 400);
  }
  db.query(
    "SELECT * FROM users WHERE username = '" + username + "'",
    async (err, result) => {
      if (err) {
        return next(new BadRequestResponse(err, 400));
      }
      if (result.length) {
        return next(new BadRequestResponse("User already exists", 400));
      }
      const hashedPassword = await hashPassword(password);
      const user = {
        username,
        password: hashedPassword,
        isActive: 1,
        isDeleted: 0,
        userType: "AdminUser",
      };
      db.query(`INSERT INTO users SET ?`, user, (err, result) => {
        if (err) {
          return next(new BadRequestResponse(err, 400));
        }
        return next(new OkResponse("User Created Successfully", 200));
      });
    },
  );
};
const register = async (req, res, next) => {
  const { username, email, address, password } = req.body.user || req.body;
  if (!username || !email || !address || !password) {
    return next(new BadRequestResponse("Please fill all the fields", 400));
  }
  db.query(
    `SELECT * FROM users WHERE email = '${email}'`,
    async (err, result) => {
      if (err) {
        return next(new BadRequestResponse("Something went wrong", 400));
      }
      console.log(result);
      if (result.length) {
        return next(new BadRequestResponse("User already exists"));
      }

      const { OTP, OTPExpiry } = setOTP();
      console.log(OTP, OTPExpiry);
      const hashedPassword = await hashPassword(password);
      console.log(hashedPassword);

      const query = `INSERT INTO users (username,email,address, password, OTP, OTPExpiry) VALUES ('${username}', '${email}', '${address}', '${hashedPassword}', '${OTP}', '${OTPExpiry}')`;

      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return next(new BadRequestResponse(err, 400));
        } else {
          return next(new OkResponse("User Registered Successfully", 200));
        }
      });
    },
  );
};

const verifyOTP = (req, res, next) => {
  const { email, otp } = req.body.user;
  console.log(email, otp);
  const query = `SELECT * FROM users WHERE email = '${email}' AND otp = '${otp}' AND otp_expiry > ${Date.now()}`;
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      return next(new BadRequestResponse(err, 400));
    }
    if (result.length === 0) {
      return next(new UnauthorizedResponse("Invalid OTP or Expired"));
    }
    if (result.length > 0) {
      const query = `UPDATE users SET otp = '', otp_expiry = '', isEmailVerified = TRUE, isOTPVerified = TRUE WHERE email = '${email}'`;
      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return next(new BadRequestResponse(err));
        }
        return next(new OkResponse("OTP Verified"));
      });
    }
  });
};

const login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      console.log(user, err, info);
      if (err) {
        next(new BadRequestResponse(err, 400));
      }
      if (!user) {
        console.log("User not found");
        next(new UnauthorizedResponse(info.message, 401));
      } else {
        const token = generateToken(user.username, user.password);
        delete user.password;

        next(new OkResponse({ ...user, token: token }, 200));
      }
    },
  )(req, res, next);
};

const updateUser = (req, res, next) => {
  const { username, password } = req.body.user || req.body;
  const { id } = req.params;
  if (!username || !password) {
    return next(new BadRequestResponse("Please fill all the fields", 400));
  }
  if (!id) {
    return next(new BadRequestResponse("Please provide user id", 400));
  }
  db.query(`SELECT * FROM users WHERE id = '${id}'`, async (err, result) => {
    if (err) {
      return next(new BadRequestResponse("Something went wrong", 400));
    }
    console.log(result);
    if (result.length == 0) {
      return next(
        new BadRequestResponse("No user found against the given Id", 400),
      );
    }

    if (result.length > 0) {
      console.log(result[0].userType);
      if (result[0].userType === "SuperAdmin") {
        return next(
          new BadRequestResponse("You cannot update SuperAdmin info", 400),
        );
      }
      const hashedPassword = await hashPassword(password);
      console.log(username);
      const query = `UPDATE users SET username = '${username}' , password = '${hashedPassword}'  WHERE id = '${id}'`;
      console.log(query);
      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return next(new BadRequestResponse(err, 400));
        }
        return next(new OkResponse("User updated successfully", 200));
      });
    }
  });
};

// @ts-ignore
const deleteUser = (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new BadRequestResponse("Please provide user id", 400));
  }
  db.query(`SELECT * FROM users WHERE id = '${id}'`, async (err, result) => {
    if (err) {
      return next(new BadRequestResponse("Something went wrong", 400));
    }
    console.log(result);
    if (result.length == 0) {
      return next(
        new BadRequestResponse("No user found against the given Id", 400),
      );
    }

    if (result.length > 0) {
      console.log(result[0].userType);
      if (result[0].userType === "SuperAdmin") {
        return next(
          new BadRequestResponse("You cannot delete SuperAdmin", 400),
        );
      }
      const query = `UPDATE users SET isDeleted = 1, isActive=0 WHERE id = '${id}'`;
      console.log(query);
      db.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return next(new BadRequestResponse(err, 400));
        }
        return next(new OkResponse("User deleted successfully", 200));
      });
    }
  });
};
const adminLogin = (req, res, next) => {
  const { email, password } = req.body.user || req.body;
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  db.query(query, (err, result) => {
    console.log(result);
    console.log(result[0].id);
    if (err) {
      console.log(err);
      return next(new BadRequestResponse(err));
    }
    if (result.length === 0) {
      return next(new UnauthorizedResponse("User doesn't exist"));
    }
    if (result.length > 0) {
      console.log(password, result[0].password);
      bcrypt.compare(
        password.toString(),
        result[0].password.toString(),
        function (err, _result) {
          console.log(result);
          if (err) {
            console.log(err);
            return next(new BadRequestResponse(err));
          }
          if (_result) {
            const token = generateToken(email, result[0].id);
            delete result[0].password;
            next(new OkResponse({ ...result[0], token: token }, 200));
          } else {
            res
              .status(401)
              .send(new UnauthorizedResponse("Invalid Password", 401));
          }
        },
      );
    }
  });
};
const setOTP = () => {
  const OTP = Math.floor(1000 + Math.random() * 9000);
  const date = new Date();
  const OTPExpiry = date.setMinutes(
    date.getMinutes() + +process.env.OTP_EXPIRY_TIME,
  );
  return { OTP, OTPExpiry };
};

const getAll = (req, res, next) => {
  const query = `SELECT * FROM users where isActive=1 and isDeleted=0`;
  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      return next(new BadRequestResponse(err, 400));
    }
    if (result.length > 0) {
      for (let user of result) {
        delete user.password;
      }
    }
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

const generateToken = (email, id) => {
  return JWT.sign({ email, id }, process.env.JWT_SECRET);
};
module.exports = {
  register,
  verifyOTP,
  login,
  adminLogin,
  createUser,
  deleteUser,
  updateUser,
  getAll,
};
