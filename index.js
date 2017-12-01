"use strict";

/* peer/native dependencies */
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const bodyParser = require("body-parser");

/* relative dependencies */
const client = require("./client");
const userUtils = require("./user-utils");

const app = express();

const STATE = {
  signedIn: false,
  currentUser: null
};

/* create user */
app.post("/:user/:password/", (req, res) => {
  if (STATE.signedIn) {
    res.send(`You are already signed in as ${STATE.currentUser}`);
    return;
  }

  const { user, password } = req.params;

  const re = new RegExp(user);
  const userExists =
    fs.readFileSync("users.csv", "utf8")
      .match(re);
  if (userExists) {
    res.send("User already exists");
    return;
  }

  const id = userUtils.incrementId();

  userUtils.hashPassword(password, (passwordDigest) => {
    fs.appendFileSync("users.csv", `${user},${passwordDigest},${id},false\n`);
    console.log(`User created: ${user} with id ${id}`);
    STATE.signedIn = true;
    STATE.currentUser = user;
    res.send(`Welcome ${user}!`);
  });
});

app.post("/signin/:user/:password/", (req, res) => {
  if (STATE.signedIn) {
    res.send("You are already signed in!");
    return;
  }

  const USERS = userUtils.parseUsers();

  const { user, password } = req.params;
  let userExists = false;
  for (let i = 0; i < USERS.length; i++) {
    if (USERS[i].user === user) {
      if (USERS[i].deleted === "true") {
        res.send(`${user} has been deleted`);
        return;
      }

      userExists = true;
      userUtils.hashPassword(password, (passwordDigest) => {
        if (USERS[i].passwordDigest === passwordDigest) {
          STATE.signedIn = true;
          STATE.currentUser = user;
          res.send(`Welcome back ${user}!`);
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

 app.post("/signout", (req, res) => {
   if (STATE.signedIn = false) {
     res.send("You are not currently signed in!");
     return;
   }

   STATE.signedIn = false;
   STATE.currentUser = null;
   res.send("Signing out.");
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
   fs.writeFile("new-image.jpg", req.body, (err) => {
     if (err) throw err;
     console.log("File saved: new-image.jpg");
   });
 });

app.listen(4567, () => console.log("Listening on port 4567..."));
