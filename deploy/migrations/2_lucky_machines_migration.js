const LuckyMachineCoordinator = artifacts.require("LuckyMachineCoordinator");
const LuckyMachineFactory = artifacts.require("LuckyMachineFactory");
const { LinkToken } = require("@chainlink/contracts/truffle/v0.4/LinkToken");
const { Oracle } = require("@chainlink/contracts/truffle/v0.6/Oracle");
require("dotenv").config();

module.exports = async (deployer, network, [defaultAccount]) => {
  // Local (development) networks need their own deployment of the LINK
  // token and the Oracle contract
  if (
    !network.startsWith("kovan") &&
    !network.startsWith("mumbai") &&
    !network.startsWith("matic") &&
    !network.startsWith("mainnet")
  ) {
    Oracle.setProvider(deployer.provider);
    try {
      await deployer.deploy(LinkToken, { from: defaultAccount });
      await deployer.deploy(Oracle, LinkToken.address, {
        from: defaultAccount
      });
      await deployer.deploy(LuckyMachineCoordinator, LinkToken.address);
      await deployer.deploy(LuckyMachineFactory);
    } catch (err) {
      console.error(err);
    }
  } else {
    //LINK Addresses
    let kovanLINK = "0xa36085f69e2889c224210f603d836748e7dc0088";
    let mumbaiLINK = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
    let maticLINK = "0xb0897686c545045aFc77CF20eC7A532E3120E0F1";
    let mainnetLINK = "0x514910771af9ca656af840dff83e8264ecf986ca";

    try {
      if (network.startsWith("kovan")) {
        //(address _coordinator, address _linkToken, bytes32 _keyHash, uint256 _fee)
        await deployer.deploy(
          LuckyMachineCoordinator,
          process.env.VRF_COORDINATOR_KOVAN,
          kovanLINK,
          process.env.KEY_HASH_KOVAN,
          process.env.FEE_KOVAN
        );
      } else if (network.startsWith("mumbai")) {
        await deployer.deploy(
          LuckyMachineCoordinator,
          process.env.VRF_COORDINATOR_MUMBAI,
          mumbaiLINK,
          process.env.KEY_HASH_MUMBAI,
          process.env.FEE_MUMBAI
        );
      } else if (network.startsWith("matic")) {
        await deployer.deploy(
          LuckyMachineCoordinator,
          process.env.VRF_COORDINATOR_MATIC,
          maticLINK,
          process.env.KEY_HASH_MATIC,
          process.env.FEE_MATIC
        );
      } else if (network.startsWith("mainnet")) {
        await deployer.deploy(
          LuckyMachineCoordinator,
          process.env.VRF_COORDINATOR_MAINNET,
          mainnetLINK,
          process.env.KEY_HASH_MAINNET,
          process.env.FEE_MAINNET
        );
      }

      await deployer.deploy(LuckyMachineFactory);
    } catch (err) {
      console.error(err);
    }
  }
};
