"use strict";

module.exports = ((http) => {
  return {
    createUser: (user, password) => {
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

      const options = {
        hostname: "localhost",
        port: 4567,
        path: `/${user}/${password}/`,
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
    signIn: (user, password) => {
      const options = {
        hostname: "localhost",
        port: 4567,
        path: `/signin/${user}/${password}/`,
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
    signOut: () => {
      const options = {
        hostname: "localhost",
        port: 4567,
        path: `/signout/`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength("")
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
    getSecret: () => {
      http.get("http://localhost:4567/secret", (res) => {
        const statusCode = res.statusCode;
        const contentType = res.headers["content-type"];

        let error;
        if (statusCode !== 200) {
          error = new Error("Request Failed.\n" +
                            `Status Code: ${statusCode}`);
        } else if (!/^text\/html/.test(contentType)) {
          error = new Error("Invalid content type.\n" +
                            `Expected application/json but received ${contentType}`);
        }
        if (error) {
          console.error(error.message);
          res.resume();
          return;
        }

        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", (chunk) => { rawData += chunk; });
        res.on("end", () => {
          try {
            console.log(rawData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on("error", (e) => {
        console.error(`Got error: ${e.message}`);
      });
    },
    deleteUser: (user, password) => {
      const options = {
        hostname: "localhost",
        port: 4567,
        path: `/delete/${user}/${password}`,
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
    }
  };
})(require("http"));
