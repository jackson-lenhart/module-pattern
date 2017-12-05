"use strict";

module.exports = ((fs, crypto, bcrypt) => {
  return {
    parseUsers: (callback) => {
      fs.readFile("users.csv", "utf8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Initial data: ", data);
        const usersArr = data.trim().split("\n");
        console.log("Users Array: ", usersArr);
        const fields = usersArr[0].split(",");
        console.log("Fields: ", fields);
        const result = usersArr.slice(1)
          .map((line) => {
            console.log("Each line split by commas: ", line.split(","));
            return line.split(",");
          })
          .map((userArr) => {
            return userArr.reduce((user, el, i) => {
              user[fields[i]] = el;
              console.log(`User on iteration ${i}: `, user)
              return user;
            }, {});
          })
        console.log("Result: ", result);
        callback(result);
      });
    },
    incrementId: () => {
      const users =
        fs.readFileSync("users.csv", "utf8")
          .trim()
          .split("\n")
          .map((line) => line.split(","));
      const prevId = parseInt(users[users.length - 1][2], 10);
      if (isNaN(prevId)) {
        return 1;
      } else {
        return prevId + 1;
      }
    },
    deleteUser: (id) => {
      const regex = new RegExp(`${id},false`)
      const newUsersFile =
        fs.readFileSync("users.csv", "utf8")
          .replace(regex, `${id},true`);

      fs.writeFileSync("users.csv", newUsersFile, "utf8");
    },
    undeleteUser: (id) => {
      const regex = new RegExp(`${id},true`)
      const newUsersFile =
        fs.readFileSync("users.csv", "utf8")
          .replace(regex, `${id},false`);

      fs.writeFileSync("users.csv", newUsersFile, "utf8");
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
    /*hashPassword: (password, successFn) => {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          successFn(hash);
        });
      });
    }*/
  };
})(require("fs"), require("crypto"), require("bcrypt"));
