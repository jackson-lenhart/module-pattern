"use strict";

module.exports = (({
  generateDeck,
  generateHand,
  handEvaluator,
  compareResults
}, { handleTie }) => {
  return {
    testEvaluator: () => {
      for (let i = 0; i < 10; i++) {
        console.log("RETURN FROM HAND EVALUATOR", handEvaluator(
          generateHand(
            5,
            generateDeck()
          ).hand
        ));
      }
    },
    testComparison: () => {
      const deck = generateDeck();
      const handObj = generateHand(5, deck);
      const hand1 = handObj.hand;
      const hand2 = generateHand(5, handObj.deck).hand;
      console.log("hand 1:", hand1);
      console.log("hand 2:", hand2);

      const mockData = {
        players: ["sam", "edith"],
        hands: {
          sam: hand1,
          edith: hand2
        }
      };

      const results = mockData.players.map(p =>
        handEvaluator(mockData.hands[p])
      );

      console.log(
        "RESULT FROM COMPARE RESULTS:",
        compareResults(results)
      );
    },
    testTie: () => {
      const mockStraightFlush1 = handEvaluator([
        { value: 'A', suit: 'h', rawValue: 14, id: 'ry-zvo1bKrz' },
        { value: 'K', suit: 'h', rawValue: 13, id: 'r1mwsy-YBM' },
        { value: 'Q', suit: 'h', rawValue: 12, id: 'HJUlDiJZtHG' },
        { value: 'J', suit: 'h', rawValue: 11, id: 'HJcxwj1ZKBM' },
        { value: '10', suit: 'h', rawValue: 10, id: 'BJfMwiJWYSM' }
      ]);

      const mockStraightFlush2 = handEvaluator([
        { value: '9', suit: 'd', rawValue: 9, id: 'ry-zvo1bKrz' },
        { value: 'K', suit: 'd', rawValue: 13, id: 'r1mwsy-YBM' },
        { value: 'Q', suit: 'd', rawValue: 12, id: 'HJUlDiJZtHG' },
        { value: 'J', suit: 'd', rawValue: 11, id: 'HJcxwj1ZKBM' },
        { value: '10', suit: 'd', rawValue: 10, id: 'BJfMwiJWYSM' }
      ]);

      console.log("HAND VALUES FROM MOCK RESULT",
        mockStraightFlush1, mockStraightFlush2
      );

      console.log("SHOULD BE 1",
        handleTie(mockStraightFlush1, mockStraightFlush2)
      );

      const mockQuads1 = handEvaluator([
        { value: 'A', suit: 'h', rawValue: 14, id: 'ry-zvo1bKrz' },
        { value: 'A', suit: 'c', rawValue: 14, id: 'r1mwsy-YBM' },
        { value: 'A', suit: 'h', rawValue: 14, id: 'HJUlDiJZtHG' },
        { value: 'A', suit: 'h', rawValue: 14, id: 'HJcxwj1ZKBM' },
        { value: '10', suit: 'h', rawValue: 10, id: 'BJfMwiJWYSM' }
      ]);

      const mockQuads2 = handEvaluator([
        { value: 'A', suit: 'h', rawValue: 14, id: 'ry-zvo1bKrz' },
        { value: 'A', suit: 'c', rawValue: 14, id: 'r1mwsy-YBM' },
        { value: 'A', suit: 'h', rawValue: 14, id: 'HJUlDiJZtHG' },
        { value: 'A', suit: 'h', rawValue: 14, id: 'HJcxwj1ZKBM' },
        { value: '11', suit: 'h', rawValue: 11, id: 'BJfMwiJWYSM' }
      ]);

      console.log("HAND VALUES FROM QUADS:", mockQuads1, mockQuads2);

      console.log("SHOULD BE -1",
        handleTie(mockQuads1, mockQuads2)
      );

      const mockBoat1 = handEvaluator(
        [
          { value: '9', suit: 'h', rawValue: 9, id: 'ry-zvo1bKrz' },
          { value: 'K', suit: 'c', rawValue: 13, id: 'r1mwsy-YBM' },
          { value: 'K', suit: 'h', rawValue: 13, id: 'HJUlDiJZtHG' },
          { value: '9', suit: 'h', rawValue: 9, id: 'HJcxwj1ZKBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'BJfMwiJWYSM' }
        ]
      );

      const mockBoat2 = handEvaluator(
        [
          { value: '3', suit: 'h', rawValue: 3, id: 'ry-zvo1bKrz' },
          { value: '2', suit: 'c', rawValue: 2, id: 'r1mwsy-YBM' },
          { value: '3', suit: 'h', rawValue: 3, id: 'HJUlDiJZtHG' },
          { value: '2', suit: 'h', rawValue: 2, id: 'HJcxwj1ZKBM' },
          { value: '3', suit: 'h', rawValue: 3, id: 'BJfMwiJWYSM' }
        ]
      );

      console.log("HAND VALUES FROM BOATS:", mockBoat1, mockBoat2);

      console.log(
        "SHOULD BE 1",
        handleTie(mockBoat1, mockBoat2)
      );

      const mockFlush1 = handEvaluator(
        [
          { value: '3', suit: 'h', rawValue: 3, id: 'ry-zvo1bKrz' },
          { value: '6', suit: 'h', rawValue: 6, id: 'r1mwsy-YBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'HJUlDiJZtHG' },
          { value: '2', suit: 'h', rawValue: 2, id: 'HJcxwj1ZKBM' },
          { value: '10', suit: 'h', rawValue: 10, id: 'BJfMwiJWYSM' }
        ]
      );

      const mockFlush2 = handEvaluator(
        [
          { value: '3', suit: 's', rawValue: 3, id: 'ry-zvo1bKrz' },
          { value: '6', suit: 's', rawValue: 6, id: 'r1mwsy-YBM' },
          { value: '9', suit: 's', rawValue: 9, id: 'HJUlDiJZtHG' },
          { value: 'J', suit: 's', rawValue: 11, id: 'HJcxwj1ZKBM' },
          { value: '8', suit: 's', rawValue: 8, id: 'BJfMwiJWYSM' }
        ]
      );

      console.log("HAND VALUES FROM FLUSH:", mockFlush1, mockFlush2);

      console.log(
        "SHOULD BE -1",
        handleTie(mockFlush1, mockFlush2)
      );

      const mockStraight1 = handEvaluator(
        [
          { value: '7', suit: 's', rawValue: 7, id: 'ry-zvo1bKrz' },
          { value: '10', suit: 'h', rawValue: 10, id: 'r1mwsy-YBM' },
          { value: '9', suit: 's', rawValue: 9, id: 'HJUlDiJZtHG' },
          { value: '6', suit: 's', rawValue: 6, id: 'HJcxwj1ZKBM' },
          { value: '8', suit: 's', rawValue: 8, id: 'BJfMwiJWYSM' }
        ]
      );

      const mockStraight2 = handEvaluator(
        [
          { value: '7', suit: 'c', rawValue: 7, id: 'ry-zvo1bKrz' },
          { value: '10', suit: 's', rawValue: 10, id: 'r1mwsy-YBM' },
          { value: '9', suit: 's', rawValue: 9, id: 'HJUlDiJZtHG' },
          { value: 'J', suit: 's', rawValue: 11, id: 'HJcxwj1ZKBM' },
          { value: '8', suit: 's', rawValue: 8, id: 'BJfMwiJWYSM' }
        ]
      );

      console.log("HAND VALUES FROM STRAIGHT:", mockStraight1, mockStraight2);

      console.log(
        "SHOULD BE -1",
        handleTie(mockStraight1, mockStraight2)
      );

      const mockTrips1 = handEvaluator(
        [
          { value: '9', suit: 'h', rawValue: 9, id: 'ry-zvo1bKrz' },
          { value: '10', suit: 'c', rawValue: 10, id: 'r1mwsy-YBM' },
          { value: 'A', suit: 'h', rawValue: 14, id: 'HJUlDiJZtHG' },
          { value: '9', suit: 'h', rawValue: 9, id: 'HJcxwj1ZKBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'BJfMwiJWYSM' }
        ]
      );

      const mockTrips2 = handEvaluator(
        [
          { value: '9', suit: 'h', rawValue: 9, id: 'ry-zvo1bKrz' },
          { value: '10', suit: 'c', rawValue: 10, id: 'r1mwsy-YBM' },
          { value: 'A', suit: 'h', rawValue: 14, id: 'HJUlDiJZtHG' },
          { value: '9', suit: 'h', rawValue: 9, id: 'HJcxwj1ZKBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'BJfMwiJWYSM' }
        ]
      );

      console.log("VALUE FROM TRIPS", mockTrips1, mockTrips2);

      console.log(
        "SHOULD BE 0",
        handleTie(mockTrips1, mockTrips2)
      );

      const mock2Pair1 = handEvaluator(
        [
          { value: '9', suit: 'h', rawValue: 9, id: 'ry-zvo1bKrz' },
          { value: '2', suit: 'c', rawValue: 2, id: 'r1mwsy-YBM' },
          { value: 'A', suit: 'h', rawValue: 14, id: 'HJUlDiJZtHG' },
          { value: '2', suit: 'h', rawValue: 2, id: 'HJcxwj1ZKBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'BJfMwiJWYSM' }
        ]
      );

      const mock2Pair2 = handEvaluator(
        [
          { value: '9', suit: 'h', rawValue: 9, id: 'ry-zvo1bKrz' },
          { value: '10', suit: 'c', rawValue: 10, id: 'r1mwsy-YBM' },
          { value: 'K', suit: 'h', rawValue: 13, id: 'HJUlDiJZtHG' },
          { value: '10', suit: 'h', rawValue: 10, id: 'HJcxwj1ZKBM' },
          { value: '9', suit: 'h', rawValue: 9, id: 'BJfMwiJWYSM' }
        ]
      );

      console.log("VALUES FROM 2 PAIR", mock2Pair1, mock2Pair2);

      console.log(
        "SHOULD BE -1:",
        handleTie(mock2Pair1, mock2Pair2)
      );
    }
  };
})(require("./poker"), require("./poker-utils"));
