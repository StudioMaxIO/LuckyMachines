const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const luckyMachineFilename = "LuckyMachine.sol";
const luckyMachinePath = path.resolve(
  __dirname,
  "contracts",
  luckyMachineFilename
);
const luckyMachineSource = fs.readFileSync(luckyMachinePath, "utf8");
//
// const linkTokenFilename = "LinkTokenInterface.sol";
// const linkTokenPath = path.resolve(__dirname, "contracts", linkTokenFilename);
// const linkTokenSource = fs.readFileSync(linkTokenPath, "utf8");
//
// const safeMathFilename = "LinkTokenInterface.sol";
// const safeMathPath = path.resolve(__dirname, "contracts", safeMathFilename);
// const safeMathSource = fs.readFileSync(safeMathPath, "utf8");
//
// const vrfConsumerBaseFilename = "LinkTokenInterface.sol";
// const vrfConsumerBasePath = path.resolve(
//   __dirname,
//   "contracts",
//   vrfConsumerBaseFilename
// );
// const vrfConsumerBaseSource = fs.readFileSync(vrfConsumerBasePath, "utf8");
//
// const vrfRequestIDBaseFilename = "LinkTokenInterface.sol";
// const vrfRequestIDBasePath = path.resolve(
//   __dirname,
//   "contracts",
//   vrfRequestIDBaseFilename
// );
// const vrfRequestIDBaseSource = fs.readFileSync(vrfRequestIDBasePath, "utf8");

var input = {
  language: "Solidity",
  sources: {
    "LuckyMachine.sol": {
      content: luckyMachineSource
    }
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"]
      }
    }
  }
};

const luckyMachineOutput = JSON.parse(solc.compile(JSON.stringify(input)))
  .contracts[luckyMachineFilename];

fs.ensureDirSync(buildPath);

for (let contract in luckyMachineOutput) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract + ".json"),
    luckyMachineOutput[contract]
  );
}
