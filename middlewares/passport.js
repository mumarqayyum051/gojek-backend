const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("../db");

module.exports = function (passport) {
  console.log(passport);
  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      (username, password, done) => {
        console.log(username, password);
        const query = `SELECT * FROM users WHERE username = '${username}'`;
        db.query(query, async (err, result) => {
          console.log(err, result);
          if (err) {
            return done(err);
          }
          if (!result.length) {
            return done(null, false, {
              message: "No User found against this username",
            });
          }

          const hashedPassword = result[0].password;
          console.log(hashedPassword, password);
          let isMatch = await bcrypt.compare(
            password.toString(),
            hashedPassword,
          );
          if (isMatch) {
            return done(null, result[0]);
          } else {
            return done(null, false, { message: "Incorrect Password" });
          }
        });
      },
    ),
  );
};
