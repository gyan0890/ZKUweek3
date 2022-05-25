// [bonus] implement an example game from part d
pragma circom 2.0.0;

// [assignment] implement a variation of mastermind from https://en.wikipedia.org/wiki/Mastermind_(board_game)#Variation as a circuit
//Memory Game

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/mux1.circom";


//Presenting a demo game with 4 inputs, there can be more as well.
template MemoryGame() {
    // Public inputs
    signal input pubGuessNum1;
    signal input pubIndex1;
    signal input pubGuessNum2;
    signal input pubIndex2;

    signal input privSolnNum1;
    signal input privSolnIndex1;
    signal input privSolnNum2;
    signal input privSolnIndex2;

    // Output
    signal output solnL;
    signal output solnR;

    //For simplicity, let's think of a 4*4 grid as an array of 16 elements
    //The array can be read as the grid from left to right, top to bottom
    
    var grid[4] = [privSolnNum1,privSolnIndex1,privSolnNum2,privSolnIndex2];
    var guess[4] = [pubGuessNum1,pubIndex1,pubGuessNum2,pubIndex2];

    var j = 0;
    component lessThan[8];

    //Adding a constraint to keep the numbers in the grid less than 9
    for (j=0; j<4; j=j+2) {
        lessThan[j] = LessThan(4);
        lessThan[j].in[0] <== guess[j];
        lessThan[j].in[1] <== 9;
        lessThan[j].out === 1;
        lessThan[j+4] = LessThan(4);
        lessThan[j+4].in[0] <== grid[j];
        lessThan[j+4].in[1] <== 9;
        lessThan[j+4].out === 1;
    }

    //Adding a constraint to keep the indexes in the input and output to be less than 16
    for (j=1; j<4; j=j+2) {
        lessThan[j] = LessThan(4);
        lessThan[j].in[0] <== guess[j];
        lessThan[j].in[1] <== 16;
        lessThan[j].out === 1;
        lessThan[j+4] = LessThan(4);
        lessThan[j+4].in[0] <== grid[j];
        lessThan[j+4].in[1] <== 16;
        lessThan[j+4].out === 1;
    }

    //This variable will be the output variable.
    //Output format will be one of LR(between 0 and 1)
    // 00 --> Both num1 and num2 have been guessed wrongly
    //01 --> Num1 has been guessed correctly and num2 wrongly
    //10 --> Num2 has been guessed correctly and num1 wrongly
    //11 --> Num1 and Num2 have been guessed correctly
    
    var r = 0;
    var l = 0;

    component equalGuess[4];

    equalGuess[0] = IsEqual();
    equalGuess[0].in[0] <== guess[0];
    equalGuess[0].in[1] <== grid[0];

    equalGuess[1] = IsEqual();
    equalGuess[1].in[0] <== guess[1];
    equalGuess[1].in[1] <== grid[1];

    //Calculating the left solution
    component multiply[2];

    multiply[0] = Mux1();
    multiply[0].c[0] <== equalGuess[0].out;
    multiply[0].s <== 1;
    multiply[0].c[1] <== equalGuess[1].out;

    multiply[0].out ==> solnL;

    equalGuess[2] = IsEqual();
    equalGuess[2].in[0] <== guess[2];
    equalGuess[2].in[1] <== grid[2];

    equalGuess[3] = IsEqual();
    equalGuess[3].in[0] <== guess[3];
    equalGuess[3].in[1] <== grid[3];

    multiply[1] = Mux1();
    multiply[1].c[0] <== equalGuess[2].out;
    multiply[1].s <== 1;
    multiply[1].c[1] <== equalGuess[3].out;

    multiply[1].out ==> solnR;

}

component main = MemoryGame();



