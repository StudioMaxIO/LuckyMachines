const Jackpots = artifacts.require("Jackpots");
const LuckyMachineJackpotFactory = artifacts.require(
  "LuckyMachineJackpotFactory"
);
require("dotenv").config();

module.exports = async (deployer, network, [defaultAccount]) => {
  try {
    await deployer.deploy(Jackpots);
    await deployer.deploy(LuckyMachineJackpotFactory);
  } catch (err) {
    console.error(err);
  }
};
