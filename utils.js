"use strict";

const colors = require("colors");

module.exports = (() => {
  return {
    reverseArr: arr => {
      if (!Array.isArray(arr)) {
        console.log("Error, invalid type");
        return;
      }

      let j = arr.length - 1;
      const newArr = [];
      for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[j]);
        j--;
      }
      return newArr;
    },
    fizzBuzz: arr => {
      return arr.map(el => {
        if (el % 3 === 0 && el % 5 === 0) {
          console.log("FizzBuzz".green);
        } else if (el % 3 === 0) {
          console.log("Fizz".blue);
        } else if (el % 5 === 0) {
          console.log("Buzz".magenta);
        } else {
          console.log(el.toString().red);
        }
      });
    }
  };
})();
