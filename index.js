"use strict";

/* peer/native dependencies */
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");

/* relative dependencies */
const userUtils = require("./user-utils");
const mongoUrl = require("./mongo-url");

const app = express();

const STATE = {
  signedIn: false,
  currentUser: null
};

const jsonParser = bodyParser.json();

/* create user */
app.post("/createuser", jsonParser, (req, res) => {
  if (STATE.signedIn) {
    res.send(`You are already signed in as ${STATE.currentUser}`);
    return;
  }

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
          console.log(result);
          STATE.signedIn = true;
          STATE.currentUser = user;
          res.send(`Welcome, ${user}.`);
        }).catch((err) => {
          console.log(err);
          db.close();
        });
      }).catch((err) => {
        console.log(err);
      });
    });
  });
});

//promisify sign in
app.post("/signin/:user/:password/", (req, res) => {
  if (STATE.signedIn) {
    res.send("You are already signed in!");
    return;
  }

  const { user, password } = req.params;

  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err;

    const Users = db.collection("users");

    Users.findOne({ user }, (err, result) => {
      if (err) throw err;

      if (!result) {
        res.send("User does not exist");
        return;
      }

      bcrypt.compare(password, result.password, (err, result) => {
        if (err) throw err;

        if (result) {
          res.send(`Welcome back, ${user}`);
          STATE.signedIn = true;
          STATE.currentUser = user;
        } else {
          res.send("Password does not match our records");
        }
      });
    });
  });
});

app.post("/signout", (req, res) => {
  if (!STATE.signedIn) {
    res.send("You are not currently signed in!");
    return;
  }

  STATE.signedIn = false;
  STATE.currentUser = null;
  res.send("Signing out.");
});

app.post("/changepassword/:user/:password/:newpassword", (req, res) => {
  if (!STATE.signedIn) {
   res.send("You must be signed in to change your password!");
    return;
  }

  const { user, password, newpassword } = req.params;

  let passwordDigest = "";
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
        })
      });
    });
  });
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
