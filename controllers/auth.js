const { expressjwt } = require("express-jwt");
const db = require(".././db");
let secret = process.env.JWT_SECRET;
// @ts-ignore
// @ts-ignore
const { BadRequestResponse } = require("express-http-response");

let UnauthorizedResponse =
  // @ts-ignore
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

// @ts-ignore
const superAdmin = (req, res, next) => {
  console.log("Sdsd");
  let query = `SELECT * FROM users WHERE username = '${req.auth.username}'`;
  // @ts-ignore

  db.query(query, (err, result) => {
    if (err) {
      // @ts-ignore
      return next(new BadRequestResponse(err));
    } else {
      if (result.length) {
        if (result[0].userType !== "SuperAdmin") {
          // @ts-ignore
          return next(
            // @ts-ignore
            new UnauthorizedResponse(
              "You are not authorized to do this operation",
            ),
          );
        }
        delete result[0].password;
        delete result[0].type;
        result[0].token = req.headers.authorization.split(" ")[1];
        req.admin = result[0];
        req.authorizedUser = result[0];
        return next();
      } else {
        // @ts-ignore
        return next(new UnauthorizedResponse());
      }
    }
  });
};

const user = (req, res, next) => {
  let query = `SELECT * FROM users WHERE username = '${req.auth.username}'`;
  db.query(query, (err, result) => {
    if (err) {
      return next(new BadRequestResponse(err, 400));
    } else {
      if (result.length) {
        delete result[0].password;
        delete result[0].type;
        result[0].token = req.headers.authorization.split(" ")[1];
        req.user = result[0];
        return next();
      } else {
        return res.status(401).send(new UnauthorizedResponse());
      }
    }
  });
};
// @ts-ignore
const readPermission = (req, res, next) => {
  console.log(req.auth.id);
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
          req.admin = result[0];
          req.authorizedUser = result[0];
          return next();
        } else {
          // @ts-ignore
          return next(
            // @ts-ignore
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

// @ts-ignore
const createPermission = (req, res, next) => {
  console.log(req.auth.username);
  console.log("dsadasd");
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
          req.authorizedUser = result[0];
          return next();
        } else {
          // @ts-ignore
          return next(
            // @ts-ignore
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

// @ts-ignore
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
          req.authorizedUser = result[0];
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

// @ts-ignore
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
          req.authorizedUser = result[0];
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
  superAdmin,
  readPermission,
  createPermission,
  updatePermission,
  deletePermission,
  user,
};

module.exports = auth;
