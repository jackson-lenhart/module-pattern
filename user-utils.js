"use strict";

module.exports = ((fs, crypto) => {
  return {
    parseUsers: () => {
      fs.readFile("users.csv", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }

        const usersArr =
          data.trim()
            .split("\n");
        const fields =
          usersArr[0].split(",");
        return userArr.slice(1)
          .map((line) => line.split(","))
          .map((userArr) => {
            return userArr.reduce((user, el, i) => {
              user[fields[i]] = el;
              return user;
            }, {});
          })
      });

      /*const usersArr =
        fs.readFileSync("users.csv", "utf8")
          .trim()
          .split("\n");
      const fields = usersArr[0].split(",");
      return usersArr.slice(1)
        .map((line) => line.split(","))
        .map((userArr) => {
          return userArr.reduce((user, el, i) => {
            user[fields[i]] = el;
            return user;
          }, {});
        });*/
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
    hashPassword: (password, successFn) => {
      const hash = crypto.createHash("sha256");
      hash.on("readable", () => {
        const data = hash.read().toString();
        if (data) successFn(data);
      });

      hash.write(password);
      hash.end();
    }
  };
})(require("fs"), require("crypto"));
