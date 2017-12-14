"use strict";

module.exports = ((bcrypt) => {
  return {
    validateUser: (user, password, collection, restoring = false) => {
      return new Promise((resolve, reject) => {
        collection.findOne({ user: user }).then((result) => {
          if (!result) {
            reject(`Could not find user ${user}`);
          }

          if (result.deleted && !restoring) {
            reject(`${user} has been deleted`);
          }

          bcrypt.compare(password, result.password, (err, success) => {
            if (err) reject(`Error comparing passwords: ${err}`);

            if (!success) {
              reject("Password does not match our records");
            }

            resolve(result);
          })
        }).catch((err) => {
          reject(`Could not find user ${user}`);
        });
      });
    },
    hashPassword: (password) => {
      return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) reject(err);

          bcrypt.hash(password, salt, (err, hash) => {
            if (err) reject(err);
            resolve(hash)
          });
        })
      });
    }
  };
})(require("bcrypt"));
