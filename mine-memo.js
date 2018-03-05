"use strict";

const fs = require("fs");
const {
  generateDeck,
  generateHand,
  handEvaluator
} = require("./poker");

let memo;
try {
  memo = JSON.parse(fs.readFileSync("memo.json", "utf8"));
} catch(e) {
  memo = {};
}

function mine(iterations) {
  for (let i = 0; i < iterations; i++) {
    let deck = generateDeck();
    let hand = generateHand(5, deck).hand;
    hand.sort((a, b) => {
      let diff = b.rawValue - a.rawValue;
      if (diff === 0) {
        return a.suit.charCodeAt(0) - b.suit.charCodeAt(0);
      } else {
        return diff;
      }
    });
    let handKey = hand.reduce((acc, x) =>
      acc + x.value + x.suit
    , "");
    if (!memo[handKey]) {
      memo[handKey] = handEvaluator(hand);
      console.log("New entry:", handKey, memo[handKey]);
    }
  }
  fs.writeFileSync("memo.json", JSON.stringify(memo, null, 2));
}

module.exports = mine;
