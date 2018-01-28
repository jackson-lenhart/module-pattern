"use strict";

const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcrypt");

const { validateUser, hashPassword } = require("./user-utils");
const {
  generateDeck,
  generateHand,
  handEvaluator,
  compareResults
} = require("./poker");

const mongoUrl = require("./mongo-url");

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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

    hashPassword(password).then((hash) => {
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
  }).catch((err) => {
    res.json({ msg: "Database error", success: false });
    console.error(err);
  });
});

app.get("/user/:user", (req, res) => {
  const user = req.params.user;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  Users.findOne({ user: user }).then((result) => {
    if (!result) {
      res.json({ msg: "Could not find user", success: false });
      return;
    }

    res.json({
      user: result.user,
      balance: result.balance
    });
  }).catch((err) => {
    console.error(err);
  });
});

app.get("/user/:user/games", (req, res) => {
  const user = req.params.user;
  const db = req.app.locals.db;
  const Games = db.collection("games");

  Games.find(
    {
      users: user,
      active: true
    }
  ).toArray().then((result) => {
    if (!result) {
      res.json({ msg: "Could not find any game(s) with user", success: false });
      return;
    }
    res.json(result);
  }).catch((err) => {
    res.json({ msg: "Database error", success: false });
    console.error(err);
  });
});

app.post("/signin", jsonParser, (req, res) => {
  const { user, password } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  validateUser(user, password, Users).then((result) => {
    res.json({ msg: `Welcome back ${user}`, success: true });
  }).catch((err) => {
    res.json({ msg: `Error validating user: ${err}`, success: false });
  });
});

app.post("/changepassword", jsonParser, (req, res) => {
  const { user, password, newPassword } = req.body;
  const db = req.app.locals.db;
  const Users = db.collection("users");

  validateUser(user, password, Users).then((result) => {
    hashPassword(newPassword).then((hash) => {
      Users.update(
        { user: result.user },
        { $set: { password: hash } }
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

  validateUser(user, password, Users).then((result) => {
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

app.post("/restore", jsonParser, (req, res) => {
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

  Users.findOne({ user: to }).then((result) => {
    if (!result) {
      res.json({ msg: "'To' user does not exist", success: false });
      return;
    }

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
        console.error(`TRANSFER ERROR: Swallowed. ${to} did not receive ${amount} from ${from}`);
      })
    }).catch((err) => {
      res.json({ msg: "Database error: could not initiate transfer", success: false });
      console.error(err);
    });
  }).catch((err) => {
    console.error(err);
  });
});

app.get("/allusers", (req, res) => {
  const db = req.app.locals.db;
  const Users = db.collection("users");

  Users.find().toArray().then((result) => {
    if (!result) {
      res.json({ msg: "Could not retrieve users", success: false });
      return;
    }

    res.json(result);
  });
});

app.post("/startgame", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  const { gameId, users, scores } = req.body;
  Games.insertOne({
    gameId: gameId,
    users: users,
    scores: scores,
    active: true,
    timestamp: new Date()
  }).then((result) => {
    console.log("RESULT FROM STARTGAME ENDPOINT:", result);
    res.json({ msg: "Successfully inserted", success: true });
  }).catch((err) => {
    console.error(err);
  });
});

app.post("/postuser", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  const { user, gameId } = req.body;

  Games.update(
    { gameId: gameId },
    {
      $push: {
        users: user
      }
    }
  ).then((success) => {
    if (success) {
      console.log("Success!", success);
      res.json({ msg: "Posted user", success: true });
    } else {
      console.error("Failure on update");
      res.json({ msg: "Could not post user", success: false});
    }
  }).catch((err) => {
    console.error(err);
    res.json({ msg: "Error updating", success: false });
  });
});

app.post("/postscore", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  const { count, user, gameId } = req.body;
  Games.update(
    { gameId: gameId },
    {
      $push: {
        scores: {
          count: count,
          user: user
        }
      }
    }
  ).then((success) => {
    if (!success) {
      res.json({ msg: "Could not update game", success: false });
      return;
    }
    console.log("SUCCESS FROM POSTSCORE ENDPOINT", success);
    res.json({ msg: "Successfully posted score", success: true });
  }).catch((err) => {
    console.error(err);
  });
});

app.get("/games", (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  Games.find({ active: true })
    .toArray()
    .then((data) => {
      if (data.length === 0) {
        res.json([ "No active games" ]);
        return;
      }
      res.json(data);
    }).catch((err) => {
      console.error(err);
    });
});

app.get("/games/:gameId", (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  const { gameId } = req.params;
  Games.findOne({ gameId: gameId }).then((result) => {
    if (!result) {
      res.json({ msg: "Could not find game", success: false });
      return;
    }

    if (result.users.length)

    res.json(result);
  }).catch((err) => {
    console.error(err);
  });
});

app.get("/look/:gameId/:property", (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");
  const { gameId, property } = req.params;

  let iterations = 0;
  const lookInterval = setInterval(() => {
    iterations++;
    console.log(iterations, "iterations");
    Games.findOne({ gameId: gameId })
      .then((result) => {
        if (!result) {
          return;
        }

        if (result[property][1]) {
          res.json({
            msg: "Found property!",
            value: result,
            success: true
          });
          clearInterval(lookInterval);
        } else if (iterations > 30) {
          res.json({
            msg: "Could not find property in allocated time",
            success: false
          });
          clearInterval(lookInterval);
        }
      });
    }, 1000);
});

//send game data on end
app.post("/endgame", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  const { gameId } = req.body;
  Games.update(
    { gameId: gameId },
    { $set: { active: false } }
  ).then((result) => {
    if (!result) {
      res.json({ msg: "Failed to update", success: false });
      return;
    }
    res.json({ msg: "Updated game, no longer active", success: true });
  }).catch((err) => {
    console.error(err);
  });
});

app.get("/history", (req, res) => {
  const db = req.app.locals.db;
  const Games = db.collection("games");

  Games.find({ active: false }).toArray().then((result) => {
    if (!result) {
      res.json({ msg: "History is blank", success: true });
      return;
    }
    res.json(result);
  }).catch((err) => {
    console.error(err);
  });
});

app.post("/poker/startgame", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const PokerGames = db.collection("pokerGames");
  const { gameId, user, buyIn } = req.body;

  PokerGames.insertOne({
    gameId,
    users: [user],
    stacks: [{ user, stack: buyIn }]
  }).then((result) => {
    res.json({ msg: "Game inserted.", success: true });
  }).catch((err) => {
    console.error(err);
    res.json({ msg: "Database error", success: false });
  });
});

app.post("/poker/starthand", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const PokerHands = db.collection("pokerHands");
  const { handId, gameId, players } = req.body;

  const deck = generateDeck();
  const hands = {};
  players.forEach(p => {
    const hand = [];
    for (let i = 0; i < 5; i++) {
      const r = Math.floor(Math.random() * deck.length);
      hand.push(deck[r]);
      deck.splice(r, 1);
    }
    hands[p] = hand;
  });
  console.log("hands from starthand", hands);
  console.log("deck from starthand", deck);
  console.log("deck length", deck.length);

  PokerHands.insertOne({
    handId,
    gameId,
    players,
    hands,
    deck
  }).then((result) => {
    res.json({ msg: "Hand inserted.", success: true });
  }).catch((err) => {
    res.json({ msg: "Database error from starthand", success: false });
    console.error(err);
  });
});

app.post("/poker/endhand", jsonParser, (req, res) => {
  const db = req.app.locals.db;
  const PokerHands = db.collection("pokerHands");
  const { handId } = req.body;

  PokerHands.findOne({ handId }).then((doc) => {
    if (!doc) {
      res.json({ msg: "Hand does not exist", success: false });
      return;
    }

    const results = doc.players.map(p =>
      handEvaluator(doc.hands[p])
    );

    const winners = compareResults(results);
    res.json(winners);
  }).catch((err) => {
    res.json({ msg: "Database error from endhand", success: false });
    console.error(err);
  });
});
