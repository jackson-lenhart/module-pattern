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
  sessions: {}
};

const jsonParser = bodyParser.json();

/* create user */
app.post("/createuser", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.findOne({ user: user }).then((result) => {
      if (result) {
        const msg = "User already exists";
        res.json({ msg, success: false });
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
          res.json({ sessionId, success: true });
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
    res.json({ msg: "Could not connect to database Users", success: false });
    console.error(err);
  });
});

app.post("/signin", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");
    userUtils.validateUser(user, password, Users).then((result) => {
      res.json({ msg: `Welcome back ${user}`, success: true });
    }).catch((err) => {
      res.json({ msg: `Error validating user: ${err}`, success: false });
      db.close();
      return;
    });
  }).catch((err) => {
    console.error("Error connecting to Users:", err);
  });
});

app.post("/changepassword", jsonParser, (req, res) => {
  const { user, password, newPassword } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    userUtils.validateUser(user, password, Users).then((result) => {
      userUtils.hashPassword(newPassword).then((hash) => {
        Users.update(
          { user: result.user },
          {
            user: result.user,
            password: hash
          }
        ).then((success) => {
          res.json({ msg: "Successfully updated password", success: true });
          db.close();
        }).catch((err) => {
          console.error("Error updating user:", err);
          db.close();
        });
      }).catch((err) => {
        console.error("Error hashing password:", err);
        db.close();
      });
    }).catch((err) => {
      res.json({ msg: `Error validating user: ${err}`, success: false });
      db.close();
    });
  }).catch((err) => {
    res.json({ msg: "Could not connect to database", success: false });
    console.error(err);
  });
});

app.get("/secret", (req, res) => {
  res.send("Secret page!");
});

//refactor to use validateUser
app.post("/delete", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.findOne({ user: user }).then((result) => {
      if (!result) {
        res.json({ msg: "Could not find user", success: false });
        db.close();
        return;
      }

      if (result.deleted) {
        res.json({ msg: "User has already been deleted", success: false });
        db.close();
        return;
      }

      bcrypt.compare(password, result.password, (err, success) => {
        if (err) {
          console.error(err);
          db.close();
          return;
        }

        if (!success) {
          res.json({ msg: "Password does not match our records", success: false });
          db.close();
          return;
        }

        Users.update(
          { user: result.user },
          {
            user: result.user,
            password: result.password,
            deleted: true
          }
        ).then((result) => {
          res.json({ msg: `User ${user} successfully deleted`, success: true });
          db.close();
        }).catch((err) => {
          console.error(err);
          res.json({ msg: `${user} could not be deleted`, success: false });
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
});

app.post("/undelete", jsonParser, (req, res) => {
  const { user, password } = req.body;

  MongoClient.connect(mongoUrl).then((db) => {
    const Users = db.collection("users");

    Users.findOne({ user: user }).then((result) => {
      if (!result.deleted) {
        res.json({ msg: `User ${user} has not been deleted`, success: false });
        db.close();
        return;
      }

      bcrypt.compare(password, result.password, (err, success) => {
        if (err) throw err;

        if (!success) {
          res.json({ msg: "Password does not match our records", success: false });
          db.close();
          return;
        }

        Users.update(
          { user: user },
          {
            user: result.user,
            password: result.password,
            deleted: false
          }
        ).then((result) => {
          res.json({ msg: `User ${user} successfully restored`, success: true });
          db.close();
        }).catch((err) => {
          console.error("Error updating Users [restore user]:", err);
          res.json({ msg: `Could not delete ${user}`, success: false });
          db.close();
        });
      });
    }).catch((err) => {
      res.json({ msg: `Could not find user ${user}`, success: false });
      db.close();
      return;
    });
  }).catch((err) => {
    console.error(err);
    res.json({ msg: "Could not connect to database. Server error", success: false });
  });
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
