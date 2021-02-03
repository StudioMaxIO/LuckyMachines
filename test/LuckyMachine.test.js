const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider({ gasLimit: 100000000 }));

const compiledFactory = require("../ethereum/build/test/LuckyMachineFactory.json");
const compiledMachine = require("../ethereum/build/test/LuckyMachine.json");

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
    gas: "10000000"
  });

  [machineAddress] = await factory.methods.getMachines().call();
  machine = await new web3.eth.Contract(compiledMachine.abi, machineAddress);

  await web3.eth.sendTransaction({
    from: accounts[0],
    to: machineAddress,
    value: web3.utils.toWei("1", "ether")
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
        gas: "10000000"
      });
    } catch (err) {
      errorMessage = err.message;
      // console.log(err.message);
    }
    assert(errorMessage != "none");
  });

  it("Maximum bet enforced", async () => {
    let errorMessage = "none";
    try {
      await machine.methods.testPlaceBetFor(accounts[3], "3", "3").send({
        from: accounts[0],
        value: web3.utils.toWei("0.2", "ether"),
        gas: "10000000"
      });
    } catch (err) {
      errorMessage = err.message;
      console.log(err.message);
    }
    const finalAccountBalance = await web3.eth.getBalance(accounts[3]);
    // console.log("Final Balance:", finalAccountBalance);
    assert(errorMessage == "none");
    assert.ok(finalAccountBalance >= "100300000000000000000");
    assert.ok(finalAccountBalance < "100600000000000000000");
  });

  it("only play unplayed game", async () => {
    let errorMessage = "none";
    await machine.methods
      .testCreateGame(
        accounts[0],
        web3.utils.toWei("0.1", "ether"),
        "1",
        "true",
        "100"
      )
      .send({
        from: accounts[0],
        gas: "10000000"
      });
    try {
      await machine.methods.testPlayGame("100", "1").send({
        from: accounts[0],
        gas: "10000000"
      });
    } catch (err) {
      errorMessage = err.message;
      // console.log(err.message);
    }
    assert(errorMessage != "none");
  });

  it("only allows play if machine is funded", async () => {
    let errorMessage = "none";

    await machine.methods.testCloseMachine().send({
      from: accounts[0],
      gas: "3000000"
    });

    try {
      await machine.methods
        .testPlaceBetFor(accounts[0], maxPick, maxPick)
        .send({
          from: accounts[0],
          value: maxBet,
          gas: "3000000"
        });
    } catch (err) {
      errorMessage = err.message;
      // console.log(err.message);
    }
    assert(errorMessage != "none");
  });

  it("machine can be closed down", async () => {
    const openingBalance = web3.eth.getBalance(machine.options.address);
    if (openingBalance == 0) {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: machineAddress,
        value: web3.utils.toWei("1", "ether")
      });
    }
    try {
      await machine.methods.testCloseMachine().send({
        from: accounts[0],
        gas: "3000000"
      });
    } catch (err) {
      console.log(err.message);
    }
    const closingBalance = await web3.eth.getBalance(machine.options.address);
    assert.equal(closingBalance, "0");
  });

  it("completes winning game", async () => {
    await machine.methods.testPlaceBetFor(accounts[0], "2", "2").send({
      from: accounts[0],
      value: minBet,
      gas: "3000000"
    });
    const game = await machine.methods.games("2").call();
    assert.ok(game.played == true);
    assert.ok(game.winner == "2");
  });

  it("completes non-winning game", async () => {
    await machine.methods.testPlaceBetFor(accounts[0], "2", "3").send({
      from: accounts[0],
      value: minBet,
      gas: "3000000"
    });
    const game = await machine.methods.games("2").call();
    assert.ok(game.played == true);
    assert.ok(game.winner == "3");
  });

  it("pays out winner", async () => {
    // Should pay out bet * payout + bet. Test account starts with 100 ETH.
    // Sent from account 0 on behalf of account 1 to check 1 account values
    // unaffected by gas
    const startingAccountBalance = await web3.eth.getBalance(accounts[1]);
    const betAmountEth = "0.1";
    const betAmountWei = web3.utils.toWei(betAmountEth, "ether");
    await machine.methods.testPlaceBetFor(accounts[1], "2", "2").send({
      from: accounts[0],
      value: betAmountWei,
      gas: "3000000"
    });
    const finalAccountBalance = await web3.eth.getBalance(accounts[1]);
    // console.log(
    //   "Starting Balance:",
    //   web3.utils.fromWei(startingAccountBalance, "ether")
    // );
    // console.log(
    //   "Final Balance:",
    //   web3.utils.fromWei(finalAccountBalance, "ether")
    // );

    assert.ok(finalAccountBalance >= "100300000000000000000");
  });

  it("unplayed bets removed after game played", async () => {
    await machine.methods.testPlaceBetFor(accounts[0], "2", "3").send({
      from: accounts[0],
      value: web3.utils.toWei("0.01", "ether"),
      gas: "3000000"
    });
    const uplayedBets = await machine.methods._unplayedBets().call();
    assert.ok(uplayedBets == "0");
  });

  it("unplayed game can be refunded", async () => {
    const startingAccountBalance = await web3.eth.getBalance(accounts[2]);

    // add funding since this game is contrived, not an actual bet placed
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: machineAddress,
      value: web3.utils.toWei("0.1", "ether")
    });

    // create game that hasn't been played
    await machine.methods
      .testCreateGame(
        accounts[2],
        web3.utils.toWei("0.1", "ether"),
        "1",
        false,
        "123"
      )
      .send({
        from: accounts[0],
        gas: "3000000"
      });

    // request refund
    await machine.methods.requestRefund("123").send({
      from: accounts[0],
      gas: "3000000"
    });

    const finalAccountBalance = await web3.eth.getBalance(accounts[2]);
    const difference = finalAccountBalance - startingAccountBalance;

    // console.log("Starting Balance:", startingAccountBalance);
    // console.log("Final Balance:", finalAccountBalance);

    assert.ok(
      finalAccountBalance >=
        startingAccountBalance + web3.utils.toWei("0.1", "ether")
    );
  });
});
