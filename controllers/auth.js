const { expressjwt } = require("express-jwt");
const db = require(".././db");
let secret = process.env.JWT_SECRET;
// @ts-ignore
const { BadRequestResponse } = require("express-http-response");

let UnauthorizedResponse =
  // @ts-ignore
  require("express-http-response").UnauthorizedResponse;
function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

const admin = (req, res, next) => {
  console.log("Sdsd");
  let query = `SELECT * FROM users WHERE id = ${req.auth.id}`;
  // @ts-ignore

  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        delete result[0].password;
        delete result[0].type;
        result[0].token = req.headers.authorization.split(" ")[1];
        req.admin = result[0];
        return next();
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

const readPermission = (req, res, next) => {
  console.log(req.auth.id);
  let query = `select permissions.*, users.userType from permissions inner join users  on  users.id = permissions.userId  where users.username = '${req.auth.username}'`;
  // @ts-ignore
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        if (result[0].allowRead == 1) {
          return next();
        } else {
          // @ts-ignore
          return next(
            new UnauthorizedResponse(
              "You are not authorized to do this operation",
            ),
          );
        }
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

const createPermission = (req, res, next) => {
  console.log(req.auth);
  let query = `select permissions.*, users.userType from permissions inner join users  on  users.id = permissions.userId  where users.username = '${req.auth.username}'`;
  console.log(query);
  // @ts-ignore
  db.query(query, (err, result) => {
    console.log(result);
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        if (result[0].allowCreate == 1) {
          return next();
        } else {
          // @ts-ignore
          return next(
            new UnauthorizedResponse(
              "You are not authorized to do this operation",
            ),
          );
        }
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

const updatePermission = (req, res, next) => {
  let query = `select permissions.*, users.userType from permissions inner join users  on  users.id = permissions.userId  where users.username = '${req.auth.username}'`;
  // @ts-ignore
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        if (result[0].allowUpdate == 1) {
          return next();
        } else {
          // @ts-ignore
          return next(new UnauthorizedResponse());
        }
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

const deletePermission = (req, res, next) => {
  let query = `select permissions.*, users.userType from permissions inner join users  on  users.id = permissions.userId  where users.username = '${req.auth.username}'`;
  // @ts-ignore
  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        if (result[0].allowDelete == 1) {
          return next();
        } else {
          // @ts-ignore
          return next(new UnauthorizedResponse());
        }
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

let auth = {
  required: expressjwt({
    // @ts-ignore
    secret: secret,
    getToken: getTokenFromHeader,
    algorithms: ["HS256"],
  }),
  optional: expressjwt({
    // @ts-ignore
    secret: secret,
    credentialsRequired: false,
    getToken: getTokenFromHeader,
    algorithms: ["HS256"],
  }),
  admin,
  readPermission,
  createPermission,
  updatePermission,
  deletePermission,
};

module.exports = auth;
