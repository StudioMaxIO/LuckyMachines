import web3 from "./web3";
import LuckyMachineFactory from "@luckymachines/contracts/abi/v0.1/LuckyMachineFactory.json";

const LMFactory = (address) => {
  return new web3.eth.Contract(LuckyMachineFactory.abi, address);
};

export default LMFactory;
