"use strict";

const utils = require("./utils");

module.exports = (utils => {
  const numArr = [];
  for (let i = 0; i < 100; i++) {
    numArr[i] = i + 1;
  }

  return {
    reverseFizzBuzz: () => {
      utils.fizzBuzz(utils.reverseArr(numArr));
    }
  };
})(utils);
