"use strict";

/* peer/native dependencies */
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
const shortid = require("shortid");

/* relative dependencies */
const userUtils = require("./user-utils");
const mongoUrl = require("./mongo-url");

const app = express();

const STATE = {
  signedIn: false,
  currentUser: null,
  sessions: {}
};

const jsonParser = bodyParser.json();

/* create user */
app.post("/createuser", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.find({ user: user }).count().then((count) => {
      if (count > 0) {
        const msg = "User already exists";
        res.send(msg);
        db.close();
        return;
      }

      userUtils.hashPassword(password).then((hash) => {
        Users.insertOne({
          user,
          password: hash,
          deleted: false
        }).then((result) => {
          db.close();
          const sessionId = shortid.generate();
          const timestamp = new Date();
          STATE.sessions[sessionId] = {
            user,
            timestamp,
            active: true
          };
          res.json({ sessionId, timestamp });
          console.log(result);
        }).catch((err) => {
          console.error(err);
          db.close();
        });
      }).catch((err) => {
        console.error(err);
        db.close();
      });
    }).catch((err) => {
      console.error(err);
      db.close();
    });
  }).catch((err) => {
    console.error(err);
    db.close();
  });
});

//promisify sign in
app.post("/signin", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.findOne({ user: user }).then((result) => {
      if (!result) {
        res.send("User does not exist");
        db.close();
      }

      bcrypt.compare(password, result.password, (err, success) => {
        if (err) {
          res.send("Password does not match our records");
          db.close();
        };

        if (success) {
          const sessionId = shortid.generate();
          const timestamp = new Date();
          STATE.sessions[sessionId] = {
            user,
            timestamp,
            active: true
          };
          console.log(STATE);
          res.json({ sessionId, timestamp });
        } else {
          res.send("Password does not match our records");
        }
      });
    }).catch((err) => {
      console.error(err);
    });
  });
});

//FIX
app.post("/changepassword", jsonParser, (req, res) => {
  console.log("Body of request:", req.body);
  const { user, password, newPassword } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.findOne({ user: user }).then((result) => {
      if (!result) {
        res.send("User does not exist");
        db.close();
      }

      console.log("Password:", password);
      console.log("Result password:", result.password);
      bcrypt.compare(password, result.password, (err, success) => {
        if (err) {
          console.error(err);
          db.close();
        }

        if (!success) {
          res.send("Password does not match our records");
          db.close();
        }

        console.log("New password before hash:", newPassword);
        userUtils.hashPassword(newPassword).then((hash) => {
          console.log("Hash:", hash);
          Users.update(
            { user: result.user },
            {
              user: result.user,
              password: hash,
              deleted: false
            }
          ).then((result) => {
            db.close();
          }).catch((err) => {
            console.error(err);
            db.close();
          });
        }).catch((err) => {
          res.send("Error changing your password");
          console.error(err);
          db.close();
        });
      });
    }).catch((err) => {
      console.error(err);
      db.close();
    });
  }).catch((err) => {
    console.error(err);
  });

  /*let passwordDigest = "";
  userUtils.hashPassword(password, (hash) => {
    passwordDigest = hash;

    let newPasswordDigest = "";
    userUtils.hashPassword(newpassword, (hash) => {
    newPasswordDigest = hash;

    fs.readFile("users.csv", "utf8", (err, data) => {
      if (err) throw err;

      const newUsersFile = data.replace(passwordDigest, newPasswordDigest)
      fs.writeFile("users.csv", newUsersFile, "utf8", (err) => {
         if (err) throw err;
         res.send("Password successfully changed!");
       });
      });
    });
  })*/;
});

app.get("/secret", (req, res) => {
  if (!STATE.signedIn) {
   res.send("Permission denied.");
   return;
  }

  res.send("Secret page!");
});

app.post("/delete/:user/:password", (req, res) => {
  const USERS = userUtils.parseUsers();

  const { user, password } = req.params;
  let userExists = false;
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].user === user) {
      userExists = true;
      if (USERS[i].deleted === "true") {
        res.send(`${user} has already been deleted.`);
        return;
      }

      userUtils.hashPassword(password, (passwordDigest) => {
        if (USERS[i].passwordDigest === passwordDigest) {
          userUtils.deleteUser(USERS[i].id);
          res.send(`Successfully deleted ${user}`);
          STATE.signedIn = false;
        } else {
          res.send("Password does not match our records");
        }
      });
      break;
    }
  }

  if (!userExists) {
    res.send("User does not exist");
  }
});

app.post("/undelete/:user/:password", (req, res) => {
  const USERS = userUtils.parseUsers();

  const { user, password } = req.params;
  let userExists = false;
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].user === user) {
      userExists = true;
      if (USERS[i].deleted === "false") {
        res.send(`${user} has not been deleted`);
        return;
      }

      userUtils.hashPassword(password, (passwordDigest) => {
        if (USERS[i].passwordDigest === passwordDigest) {
          userUtils.undeleteUser(USERS[i].id);
          res.send(`${user} successfully recreated!`);
          STATE.signedIn = true;
          STATE.currentUser = user;
        } else {
          res.send("Password does not match our records");
        }
      });
      break;
    }
  }

  if (!userExists) {
    res.send("User does not exist");
  }
});

const imageParser = bodyParser.raw({ type: "image/jpeg", limit: "500mb" });

app.post("/upload", imageParser, (req, res) => {
  fs.writeFile("new-image1.jpg", req.body, (err) => {
    if (err) throw err;
    console.log("File saved: new-image1.jpg");
  });
});

app.get("/image/:id", (req, res) => {
  const id = req.params.id

  const fileName = `new-image${id}.jpg`;
  fs.readFile(fileName, (err, data) => {
    if (err) throw err;

    res.sendFile(path.join(__dirname, fileName), (err) => {
      if (err) throw err;
    });
  });
});

app.listen(4567, () => console.log("Listening on port 4567..."));
