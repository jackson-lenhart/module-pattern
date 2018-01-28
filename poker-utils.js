"use strict"

module.exports = (() => {
  const arrayCompare = (arr1, arr2) =>
    (Array.isArray(arr1) && Array.isArray(arr2)) &&
    arr1.length === arr2.length &&
    !arr1.some((val, i) => val !== arr2[i]);

  return {
    acesHighUnlessWheel: sortedHand => {
      if (arrayCompare(sortedHand.map(x => x.rawValue), [5, 4, 3, 2, 1])) {
        return sortedHand;
      }
      const onesToFourteens = sortedHand.map(x =>
        x.rawValue === 1 ? {
          ...x,
          rawValue: 14
        } : x);
      onesToFourteens.sort((a, b) => b.rawValue - a.rawValue);
      return onesToFourteens;
    },
    isStraight: sortedValues =>
      sortedValues.reduce((acc, x, i, arr) =>
        i < arr.length - 1 ?
          x - 1 === arr[i + 1] ?
            acc + 1 : acc
          : acc, 0) === 4 ? true : false,
    handleTie: (hand1, hand2) => {
      if (hand1.type !== hand2.type) {
        console.error("Types not equivalent in handleTie");
        return;
      }
      switch (hand1.type) {
        case "STRAIGHT_FLUSH":
          return hand1.value === hand2.value ?
            0 : hand1.value > hand2.value ?
              -1 : 1;
          break;
        case "QUADS":
          return hand1.value === hand2.value ?
            hand1.kicker === hand2.kicker ?
              0 : hand1.kicker > hand2.kicker ?
                -1 : 1
            : hand1.value > hand2.value ?
              -1 : 1;
          break;
        case "BOAT":
          return hand1.value === hand2.value ?
            hand1.fullOf === hand2.fullOf ?
              0 : hand1.fullOf > hand2.fullOf ?
                -1 : 1
              : hand1.value > hand2.value ?
                -1 : 1;
          break;
        case "FLUSH":
          for (let i = 0; i < 5; i++) {
            if (hand1.value[i] > hand2.value[i]) {
              return -1;
            } else if (hand1.value[i] < hand2.value[i]) {
              return 1;
            }
          }
          return 0;
          break;
        case "STRAIGHT":
          if (hand1.value > hand2.value) return -1;
          else if (hand1.value < hand2.value) return 1;
          else return 0;
          break;
        case "TRIPS":
          if (hand1.value > hand2.value) return -1;
          else if (hand1.value < hand2.value) return 1;
          else {
            for (let i = 0; i < 2; i++) {
              if (hand1.kickers[i] > hand2.kickers[i]) {
                return -1;
              } else if (hand1.kickers[i] < hand2.kickers[i]) {
                return 1;
              }
            }
            return 0;
          }
          break;
        case "2_PAIR":
          return hand1.value === hand2.value ?
            hand1.over === hand2.over ?
              hand1.kicker === hand2.kicker ?
                0 : hand1.kicker > hand2.kicker ?
                  -1 : 1
              : hand1.over > hand2.over ?
                -1 : 1
            : hand1.value > hand2.value ?
              -1 : 1;
            break;
        case "PAIR":
          if (hand1.value > hand2.value) return -1;
          else if (hand1.value < hand2.value) return 1;
          else {
            for (let i = 0; i < 3; i++) {
              if (hand1.kickers[i] > hand2.kickers[i]) {
                return -1;
              } else if (hand1.kickers[i] < hand2.kickers[i]) {
                return 1;
              }
            }
            return 0;
          }
          break;
        case "HIGH":
          for (let i = 0; i < 5; i++) {
            if (hand1.value[i] > hand2.value[i]) {
              return -1;
            } else if (hand1.value[i] < hand2.value[i]) {
              return 1;
            }
          }
          return 0;
          break;
        default:
          console.error("Invalid type");
      }
    }
  };
})();
