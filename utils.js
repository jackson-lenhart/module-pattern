"use strict";

module.exports = (() => {
  return {
    fibonacci: (num) => {
      const seq = [];
      seq[0] = 0;
      seq[1] = 1;
      for (let i = 2; i < num; i++) {
        seq[i] = seq[i - 1] + seq[i - 2];
      }

      return seq;
    },
    substrings: (str) => {
      const subs = [];
      for (let i = 0; i < str.length; i++) {
        for (let j = i + 1; j < str.length + 1; j++) {
          subs.push(str.slice(i, j));
        }
      }
      return subs;
    }
  };
})();
