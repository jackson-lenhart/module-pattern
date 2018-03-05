"use strict";

module.exports = (({
  arrayCompare,
  acesHighUnlessWheel,
  isStraight,
  handleTie
}, fs, shortid) => {
  return {
    generateDeck: () => {
      const rawValues = [];
      for (let i = 1; i <= 13; i++) {
        rawValues.push(i);
      }

      const suits = ["s", "d", "c", "h"];

      const values = rawValues.map(val => {
        switch(val) {
          case 1:
            return "A";
            break;
          case 11:
            return "J";
            break;
          case 12:
            return "Q";
            break;
          case 13:
            return "K";
            break;
          default:
            return val.toString();
        }
      });

      return suits.map(suit =>
        values.map((value, i) => ({
          value,
          suit,
          rawValue: rawValues[i],
          id: shortid.generate()
        }))
      ).reduce((acc, a) => acc.concat(a), []);
    },
    generateHand: function generateHand(numCards, deck, hand = []) {
      if (numCards === 0) return { hand, deck };
      const i = Math.floor(Math.random() * deck.length);
      const card = deck[i];
      const newDeck = deck.slice();
      newDeck.splice(i, 1);
      return generateHand(numCards - 1, newDeck, hand.concat(card));
    },
    handEvaluator: (handArr) => {
      const hand = acesHighUnlessWheel(handArr);

      const rawValues = hand.map(card => card.rawValue);

      // flush?
      const suit = hand[0].suit;
      if (!hand.some(card => card.suit !== suit)) {
        // str8 flush???
        if (isStraight(rawValues)) {
          return {
            type: "STRAIGHT_FLUSH",
            rank: 1,
            value: rawValues[0],
            msg: `Straight flush, ${hand[0].value} high`
          };
        }

        return {
          type: "FLUSH",
          rank: 4,
          value: rawValues,
          msg: `Flush, ${hand[0].value} high`
        };
      }

      // straight?
      if (isStraight(rawValues)) return {
        type: "STRAIGHT",
        rank: 5,
        value: rawValues[0],
        msg: `Straight, ${hand[0].value} high`
      };

      // quads?
      const [val1, val2] = rawValues;
      if (rawValues.filter(x => x === val1).length === 4) return {
        type: "QUADS",
        rank: 2,
        value: val1,
        kicker: rawValues.filter(x => x !== val1),
        msg: `Four of a kind, ${hand[0].value}`
      };

      if (rawValues.filter(x => x === val2).length === 4) return {
        type: "QUADS",
        rank: 2,
        value: val2,
        kicker: rawValues.filter(x => x !== val2),
        msg: `Four of a kind, ${hand[1].value}`
      };

      // full house or trips?
      let count;
      // i < 3 because if we haven't found it by 3 we won't ;)
      for (let i = 0; i < 3; i++) {
        count = 1;
        // now check if there's 3 of rawValues[i];
        // j = i + 1 because we don't need to check the value itself
        for (let j = i + 1; j < 5; j++) {
          if (rawValues[j] === rawValues[i]) count++;

          if (count === 3) {
            const others = hand.filter(card => card.rawValue !== rawValues[i]);
            if (others.length !== 2) {
              console.error("Somethings gone horribly wrong? others.length not 2 in full house nested loop");
              return;
            }
            if (others[0].rawValue === others[1].rawValue) return {
              type: "BOAT",
              rank: 3,
              value: rawValues[i],
              fullOf: others[0].rawValue,
              msg: `Full house, ${hand[i].value} full of ${others[0].value}`
            };
            // otherwise it must be trips!
            else return {
              type: "TRIPS",
              rank: 6,
              value: rawValues[i],
              kickers: others.map(x => x.rawValue),
              msg: `Three of a kind, ${hand[i].value}'s`
            };
          }
        }
      }

      // 2 pair / 1 pair?
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 5; j++) {
          if (rawValues[j] === rawValues[i]) {
            const others = hand.filter(card => card.rawValue !== rawValues[i]);
            if (others.length !== 3) {
              console.error("Somethings gone horribly wrong? others.length not 3 in 2 pair nested loop");
              return;
            }
            for (let k = 0; k < 2; k++) {
              for (let l = k + 1; l < 3; l++) {
                if (others[l].rawValue === others[k].rawValue) {
                  if (rawValues[i] === others[k].rawValue) {
                    console.error("There is a collision between 2 pairs. Something may be wrong with full house/trips");
                    return;
                  }
                  return rawValues[i] > others[k].rawValue ?
                    {
                      type: "2_PAIR",
                      rank: 7,
                      value: rawValues[i],
                      over: others[k].rawValue,
                      kicker: others.filter(x =>
                        x.rawValue !== rawValues[j])[0].rawValue,
                      msg: `Two pair, ${hand[i].value} over ${others[k].value}`
                    } : {
                      type: "2_PAIR",
                      rank: 7,
                      value: others[k].rawValue,
                      over: rawValues[i],
                      msg: `Two pair, ${others[k].value} over ${hand[i].value}`
                    };
                }
              }
            }
            // otherwise, it should be 1 pair
            return {
              type: "PAIR",
              rank: 8,
              value: rawValues[i],
              kickers: rawValues.filter(x => x !== rawValues[i]),
              msg: `One pair, ${hand[i].value}`
            };
          }
        }
      }

      // otherwise, it must be high card!!
      return {
        type: "HIGH",
        rank: 9,
        value: rawValues,
        msg: `High card, ${hand[0].value}`
      };
    },
    compareResults: results => {
      if (!Array.isArray(results)) {
        throw new Error("compareResults expects an array as it's only argument");
      }

      const winningRank = Math.min(
        ...results.map(r => r.result.rank)
      );

      const winners = results.filter(r => r.result.rank === winningRank);

      if (winners.length === 1) {
        return winners;
      }

      winners.sort((a, b) => handleTie(a.result, b.result));
      return winners.filter((w, i, arr) => {
        if (i === 0) return true;
        return handleTie(w.result, arr[0].result) === 0 ?
          true : false;
      });
    }
  };
})(require("./poker-utils"), require("fs"), require("shortid"));
