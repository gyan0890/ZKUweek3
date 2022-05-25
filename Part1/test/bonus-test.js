// [bonus] unit test for bonus.circom
//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("System of equations test", function () {
    this.timeout(100000000);

    it("Success Path Bonus: Passing the correct inputs and getting the output", async () => {
        const circuit = await wasm_tester("contracts/circuits/bonus.circom");
        await circuit.loadConstraints();

        //Imagine a 4*4 grid where there are 16 tiles. The indexes represented in 1D array range from 0-15
        //Constraints on numbers is less than 9

        const publicSolution = [1,0,1,5];

        const INPUT = {
        pubGuessNum1 : 1,
        pubIndex1:0,
        pubGuessNum2: 1,
        pubIndex2: 5,

        privSolnNum1: 1,
        privSolnIndex1: 0,
        privSolnNum2: 1,
        privSolnIndex2: 5

        }

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log("Witness[0]", witness[0]);
        console.log("Witness[1]", witness[1]);
        
        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });

});