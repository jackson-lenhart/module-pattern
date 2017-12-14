"use strict";

const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");
const shortid = require("shortid");

const userUtils = require("./user-utils");
const mongoUrl = require("./mongo-url");

const app = express();

MongoClient.connect(mongoUrl).then((db) => {
  app.locals.db = db;
  app.listen(4567, () => console.log("Listening on port 4567..."));
}).catch((err) => {
  console.error(err);
});

const jsonParser = bodyParser.json();

app.post("/createuser", jsonParser, (req, res) => {
  const { user, password } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  Users.findOne({ user: user }).then((result) => {
    if (result) {
      res.json({ msg: "User already exists", success: false });
      return;
    }

    userUtils.hashPassword(password).then((hash) => {
      Users.insertOne({
        user,
        password: hash,
        balance: 0,
        deleted: false
      }).then((result) => {
        res.json({ msg: `User ${user} successfully created`, success: true });
        console.log(result);
      }).catch((err) => {
        res.json({ msg: "Database error: could not insert user", success: false });
        console.error(err);
      });
    }).catch((err) => {
      res.json({ msg: "Database error: could not hash password", success: false });
      console.error(err);
    });
  });
});

app.post("/signin", jsonParser, (req, res) => {
  const { user, password } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  userUtils.validateUser(user, password, Users).then((result) => {
    res.json({ msg: `Welcome back ${user}`, success: true });
  }).catch((err) => {
    res.json({ msg: `Error validating user: ${err}`, success: false });
  });
});

app.post("/changepassword", jsonParser, (req, res) => {
  const { user, password, newPassword } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  userUtils.validateUser(user, password, Users).then((result) => {
    userUtils.hashPassword(newPassword).then((hash) => {
      Users.update(
        { user: result.user },
        {
          ...result,
          password: hash
        }
      ).then((success) => {
        res.json({ msg: "Successfully changed password", success: true });
      }).catch((err) => {
        res.json({ msg: "Database error: could not change password", success: false });
        console.error(err);
      });
    }).catch((err) => {
      res.json({ msg: "Database error: could not hash password", success: false });
      console.error(err);
    });
  }).catch((err) => {
    res.json({ msg: `Error validating user: ${err}`, success: false });
  });
});

app.get("/secret", (req, res) => {
  res.send("Secret page!");
});

app.post("/delete", jsonParser, (req, res) => {
  const { user, password } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  userUtils.validateUser(user, password, Users).then((result) => {
    Users.update(
      { user: result.user },
      { $set: { deleted: true } }
    ).then((success) => {
      res.json({ msg: `Successfully deleted ${user}`, success: true });
    }).catch((err) => {
      res.json({ msg: "Database error: could not update user", success: false });
      console.error(err);
    });
  }).catch((err) => {
    res.json({ msg: `Error validating user: ${err}`, success: false });
  });
});

app.post("/undelete", jsonParser, (req, res) => {
  const { user, password } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  userUtils.validateUser(user, password, Users, true).then((result) => {
    Users.update(
      { user: result.user },
      { $set: { deleted: false } }
    ).then((success) => {
      res.json({ msg: `Successfully restored ${user}`, success: true });
    }).catch((err) => {
      res.json({ msg: "Database error: could not update user", success: false });
      console.error(err);
    });
  }).catch((err) => {
    res.json({ msg: `Error validating user: ${err}`, success: false });
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

app.post("/transfer", jsonParser, (req, res) => {
  const { from, to, amount } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  Users.update(
    { user: from },
    { $inc: { balance: -amount } }
  ).then((result) => {
    Users.update(
      { user: to },
      { $inc: { balance: amount } }
    ).then((success) => {
      res.json({ msg: "Successfully transferred funds!", success: true });
    }).catch((err) => {
      const msg = "Your funds did not make it to their destination. We are very sorry for the inconvenience, it will be fixed";
      res.json({ msg, success: false });
      console.error("TRANSFER ERROR: destination user did not receive");
    })
  }).catch((err) => {
    res.json({ msg: "Database error: could not initiate transfer", success: false });
    console.error(err);
  });
});
