//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected

const chai = require("chai");
const path = require("path");
const buildPoseidon = require("circomlibjs").buildPoseidon;
const wasm_tester = require("circom_tester").wasm;

const salt = ethers.BigNumber.from(ethers.utils.randomBytes(32));

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const assert = chai.assert;

describe("System of equations test", function () {
    this.timeout(100000000);

    it("Success Path: Passing the correct inputs and getting the output", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let poseidonJs = await buildPoseidon();

        const publicSolution = [1,3,9,4,2];
        const publicSolutionHash = ethers.BigNumber.from(
            poseidonJs.F.toObject(poseidonJs([salt, ...publicSolution]))    
        );

        const INPUT = {
            pubGuessA : 1,
            pubGuessB : 3,
            pubGuessC : 9,
            pubGuessD: 4,
            pubGuessE: 2,
            pubNumHit: 5,

            pubNumBlow: 0,
            pubSolnHash: publicSolutionHash,
            privSolnA: 1,
            privSolnB: 3,
            privSolnC: 9,
            privSolnD: 4,
            privSolnE: 2,
            privSalt: salt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log("Witness[0]", witness[0]);
        console.log("Witness[1]", witness[1]);
        //console.log(publicSolutionHash);
        // assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(1)));
    });

    it("Scenario 2: Sending 4 hits out of 5 and 0 blows", async () => {
        const circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom");
        await circuit.loadConstraints();

        let poseidonJs = await buildPoseidon();

        const publicSolution = [1,2,3,4,8];
        const publicSolutionHash = ethers.BigNumber.from(
            poseidonJs.F.toObject(poseidonJs([salt, ...publicSolution]))    
        );

        const INPUT = {
            pubGuessA : 1,
            pubGuessB : 2,
            pubGuessC : 3,
            pubGuessD: 4,
            pubGuessE: 8,
            pubNumHit: 4,
            pubNumBlow: 0,
            pubSolnHash: publicSolutionHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: salt
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        console.log("Witness[0]", witness[0]);
        console.log("Witness[1]", witness[1]);
        //console.log("Witness[1]", witness[1]);
        //console.log(publicSolutionHash);
        // assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]), Fr.e(0)));
    //     console.log("Circom constraint fails as expected, pubSolnHash === solnHashOut")
    });
});