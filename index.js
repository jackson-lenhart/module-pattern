"use strict";

const ModuleUtils = (() => {
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
          return "FizzBuzz";
        } else if (el % 3 === 0) {
          return "Fizz";
        } else if (el % 5 === 0) {
          return "Buzz";
        } else {
          return el;
        }
      });
    },
    logArr: arr => {
      arr.forEach(el => console.log(el));
    }
  };
})();

const Module1 = ((data, utils) => {
  const numArr = [];
  for (let i = 0; i < 100; i++) {
    numArr[i] = i + 1;
  }

  return {
    pubMethod: () => {
      return utils.reverseArr(data);
    },
    pubMethod2: () => {
      return utils.fizzBuzz(numArr);
    }
  };
})([1, 2, 3], ModuleUtils);

ModuleUtils.logArr(Module1.pubMethod());
ModuleUtils.logArr(Module1.pubMethod2());
