// const mysql = require('mysql');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const connection = require("./db");

async function init() {
    await seeder();
}
init();
async function seeder() {
    Promise.all([
        new Promise((resolve, reject) => {
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash("Asdf123", salt, function (err, hash) {
                    connection
                        .then((conn) => {
                            const _admins = [
                                [1, "admin", "admin@gmail.com", hash, "admin"],
                                [
                                    2,
                                    "admin2",
                                    "admin2@gmail.com",
                                    hash,
                                    "admin",
                                ],
                                [
                                    3,
                                    "admin3",
                                    "admin3@gmail.com",
                                    hash,
                                    "admin",
                                ],
                            ];

                            conn.query(
                                `INSERT INTO users(id, username, email, password, user_role) values ?`,
                                [_admins],
                                (err, result) => {
                                    if (err) reject(err);
                                    resolve(result);
                                }
                            );
                        })
                        .catch((err) => {
                            reject(err);
                        });
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
