import web3 from "./web3";
import LuckyMachine from "./build/LuckyMachine.json";

export default address => {
  return new web3.eth.Contract(LuckyMachine.abi, address);
};
