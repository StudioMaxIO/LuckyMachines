const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const luckyMachineFilename = "SMLuckyMachine.sol";
const luckyMachinePath = path.resolve(
  __dirname,
  "contracts",
  luckyMachineFilename
);
const luckyMachineSource = fs.readFileSync(luckyMachinePath, "utf8");

var input = {
  language: "Solidity",
  sources: {
    "SMProject.sol": {
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
