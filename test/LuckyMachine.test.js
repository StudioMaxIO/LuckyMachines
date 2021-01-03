const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/LuckyMachineFactory.json");
const compiledMachine = require("../ethereum/build/LuckyMachine.json");

let accounts;
let factory;
let machineAddress;
let machine;

beforeEach(async () => {});

describe("Lucky Machines", () => {
  it("deploys a factory and a machine", () => {
    assert.ok(factory.options.address);
    assert.ok(machine.options.address);
  });
});
