const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider({ gasLimit: 100000000 }));

const compiledFactory = require("../ethereum/build/LuckyMachineFactory.json");
const compiledMachine = require("../ethereum/build/LuckyMachine.json");

let accounts;
let factory;
let machineAddress;
let machine;

const maxBet = web3.utils.toWei("0.1", "ether");
const minBet = web3.utils.toWei("0.01", "ether");
const maxPick = "3";
const payout = "2";

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: "10000000" });

  await factory.methods.createMachine(maxBet, minBet, maxPick, payout).send({
    from: accounts[0],
    gas: "3000000"
  });

  [machineAddress] = await factory.methods.getMachines().call();
  machine = await new web3.eth.Contract(compiledMachine.abi, machineAddress);
  await machine.methods.fundMachine().send({
    from: accounts[0],
    value: web3.utils.toWei("1", "ether"),
    gas: "3000000"
  });
});

describe("Lucky Machines", () => {
  it("deploys a factory and a machine", () => {
    assert.ok(factory.options.address);
    assert.ok(machine.options.address);
  });
  it("Minimum bet enforced", async () => {
    let errorMessage = "none";
    try {
      await machine.methods.testPlaceBetFor(accounts[0], "3", "2").send({
        from: accounts[0],
        value: web3.utils.toWei("0.001", "ether"),
        gas: "3000000"
      });
    } catch (err) {
      errorMessage = err.message;
      console.log(err.message);
    }
    assert(errorMessage != "none");
  });
  it("Maximum bet enforced", async () => {
    let errorMessage = "none";
    try {
      await machine.methods.testPlaceBetFor(accounts[0], "3", "2").send({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
        gas: "3000000"
      });
    } catch (err) {
      errorMessage = err.message;
      console.log(err.message);
    }
    assert(errorMessage != "none");
  });
  it("only play unplayed game", async () => {
    let errorMessage = "none";
    await machine.methods
      .testCreateGame(accounts[0], "0.1", "1", true, "100")
      .send({
        from: accounts[0],
        gas: "3000000"
      });
    try {
      await machine.methods.testPlayGame("100").send({
        from: accounts[0],
        gas: "3000000"
      });
    } catch (err) {
      errorMessage = err.message;
      console.log(err.message);
    }
    assert(errorMessage != "none");
  });
  it("completes winning game", () => {});
  it("pays out winner", () => {});
  it("completes non-winning game", () => {});
  it("unplayted bets removed after game played", () => {});
  it("unplayed game can be refunded", () => {});
});
