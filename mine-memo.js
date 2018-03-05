"use strict";

const fs = require("fs");
const {
  generateDeck,
  generateHand,
  handEvaluator
} = require("./poker");
const { acesHighUnlessWheel } = require("./poker-utils");

let memo;
try {
  memo = JSON.parse(fs.readFileSync("memo.json", "utf8"));
} catch(e) {
  memo = {};
}

function mine(iterations) {
  let newEntries = 0;
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
    hand = acesHighUnlessWheel(hand);
    let handKey = hand.reduce((acc, x) =>
      acc + x.value + x.suit
    , "");
    if (!memo[handKey]) {
      newEntries++;
      memo[handKey] = handEvaluator(hand);
    }
  }
  console.log(`Finished ${iterations} iterations with ${newEntries} new entries to table`);
  fs.writeFileSync("memo.json", JSON.stringify(memo, null, 2));
}

module.exports = mine;
