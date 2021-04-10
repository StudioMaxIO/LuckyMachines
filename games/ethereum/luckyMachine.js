import web3 from "./web3";
import LuckyMachine from "@luckymachines/contracts/abi/v0.2/LuckyMachine.json";

const LM = (address) => {
  return new web3.eth.Contract(LuckyMachine.abi, address);
};

export default LM;
