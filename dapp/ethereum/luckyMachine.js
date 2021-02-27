import web3 from "./web3";
import LuckyMachine from "./build/LuckyMachine.json";

const LM = address => {
  return new web3.eth.Contract(LuckyMachine.abi, address);
};

export default LM;
