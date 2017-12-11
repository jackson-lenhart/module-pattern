"use strict";

module.exports = ((http, fs, request) => {
  const STATE = {
    signedIn: false,
    currentUser: null
  };

  return {
    createUser: (user, password) => {
      if (STATE.signedIn) {
        console.log(`Already signed in as ${currentUser}`)
        return;
      }

      const userRe = /^[-\w\.\$@\*\!]{1,30}$/;
      const passwordRe = /^[-\w\.\$@\*\!]{1,30}$/;

      if (!userRe.test(user) && !passwordRe.test(password)) {
        console.error("Invalid username and password.");
        return;
      } else if (!userRe.test(user)) {
        console.error("Invalid username");
        return;
      } else if (!passwordRe.test(password)) {
        console.error("Invalid password");
        return;
      }

      const userObj = { user, password };

      const options = {
        url: "http://localhost:4567/createuser/",
        method: "POST",
        json: userObj
      };

      request(options, (err, res, body) => {
        if (err) throw err;
        console.log("Body:", body);
        STATE.signedIn = true;
        STATE.currentUser = userObj.user;
        console.log(`STATE updated. Now signed in as ${STATE.currentUser}`);
      });
    },
    signIn: (user, password) => {
      if (STATE.signedIn) {
        console.log(`Already signed in as ${STATE.currentUser}`);
        return;
      }

      const userObj = { user, password };

      const options = {
        url: "http://localhost:4567/signin",
        method: "POST",
        json: userObj
      };

      request(options, (err, res, body) => {
        if (err) throw err;
        console.log("Body:", body)
        if (!body.success) {
          throw new Error("Error signing in:", body.msg);
        }

        STATE.signedIn = true;
        STATE.currentUser = userObj.user;
        console.log(`STATE updated. Now signed in as ${STATE.currentUser}`);
      });
    },
    signOut: () => {
      if (!STATE.signedIn) {
        console.log("You are not currently signed in!");
        return;
      }

      console.log("Signing out...");
      STATE.signedIn = false;
      STATE.currentUser = null;
    },
    changePassword: (user, password, newPassword) => {
      if (!STATE.signedIn) {
        console.log("Must be signed in to change password!");
        return;
      }

      const userUpdatePassword = {
        user,
        password,
        newPassword
      };

      const options = {
        url: "http://localhost:4567/changepassword",
        method: "POST",
        json: userUpdatePassword
      };

      request(options, (err, res, body) => {
        if (err) throw err;
        console.log("Body:", body);
      });
    },
    getSecret: () => {
      if (!STATE.signedIn) {
        console.log("Must be signed in to view this page");
        return;
      }

      request.get("http://localhost:4567/secret", (err, res, body) => {
        if (err) throw err;
        console.log("Body:", body);
      });
    },
    deleteUser: (user, password) => {
      if (!STATE.signedIn) {
        console.error("You must be signed in to delete account");
        return;
      }

      const userToDelete = {
        user,
        password
      };

      const options = {
        url: "http://localhost:4567/delete",
        method: "POST",
        json: userToDelete
      };

      request(options, (err, res, body) => {
        if (err) throw err;
        console.log("Body:", body);

        if (!body.success) {
          throw new Error(body.msg);
        }

        STATE.signedIn = false;
        STATE.currentUser = null;
      });
    },
    undeleteUser: (user, password) => {
      const options = {
        hostname: "localhost",
        port: 4567,
        path: `/undelete/${user}/${password}`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(user + password)
        }
      };

      const req = http.request(options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(chunk);
        });
      });

      req.on("error", (e) => {
        console.error(`problem with request: ${e.message}`);
      });

      req.end();
    },
    uploadImage: () => {
      const img = fs.readFileSync("swirling-galaxy.jpg");
      console.log(img);

      const options = {
        hostname: "localhost",
        port: 4567,
        path: "/upload",
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": Buffer.byteLength(img)
        }
      }

      const req = http.request(options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log("Response: " + chunk);
        });
      });

      req.write(img);
      req.end();
    }
  };
})(require("http"), require("fs"), require("request"));
