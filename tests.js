"use strict";

const colors = require("colors");
const utils = require("./utils");

function arrayCompare(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (typeof arr1[i] === "object") {
      if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) return false
    } else if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function modelUsers(multiArr, template) {
  return multiArr.map((arr) => {
    return arr.reduce((user, el, i) => {
      user[template[i]] = el;
      return user;
    }, {});
  }, []);
}

if (!arrayCompare([1, 2, 3], [1, 2, 3])) {
  throw new Error("Faulty array compare function");
}

if (!arrayCompare(utils.fibonacci(5), [0, 1, 1, 2, 3])) {
  throw new Error("Failed to generate correct sequence of length 5");
}

if (!arrayCompare(utils.fibonacci(10), [0, 1, 1, 2, 3, 5, 8, 13, 21, 34])) {
  throw new Error("Failed to generate correct sequence of length 10");
}

if (!arrayCompare(utils.substrings("abc"), [
  "a",
  "ab",
  "abc",
  "b",
  "bc",
  "c"
])) {
  throw new Error("Failed to generate correct array of substrings for string \"abc\"");
}

if (
  !arrayCompare(
    modelUsers(
      [["jackson", "lol", 1], ["user2", "haha", 2]],
      ["user", "password", "id"]
    ), [
      {
        user: "jackson",
        password: "lol",
        id: 1
      },
      {
        user: "user2",
        password: "haha",
        id: 2
      }
    ]
  )
) {
  throw new Error("Failed to model user data correctly");
}

console.log("All tests have passed!".green);
