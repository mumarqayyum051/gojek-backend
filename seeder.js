// @ts-nocheck
// const mysql = require('mysql');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const db = require("./db");

async function init() {
  await seeder();
}
init();
async function seeder() {
  Promise.all([
    new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash("superadmin123", salt, function (err, hash) {
          db.query(
            `INSERT INTO users (username, password,isActive,isDeleted,userType) VALUES ('superadmin','${hash}',  1, 0, 'SuperAdmin')`,
            (err, result) => {
              const d = `${result.insertId}`;
              if (err) {
                reject(err);
              }
              const query = `INSERT INTO permissions (userId, allowRead,allowCreate, allowUpdate,allowDelete) VALUES (${result.insertId}, 1,1,1,1)`;
              db.query(query, (err, result) => {
                if (err) {
                  reject(err);
                }
                resolve(result);
              });
            },
          );
        });
      });
    }),
  ])
    .then((values) => {
      console.log("Data Seeded");
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = seeder;
