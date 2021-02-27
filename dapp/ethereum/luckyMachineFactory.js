import web3 from "./web3";
import LuckyMachineFactory from "./build/LuckyMachineFactory.json";

export default address => {
  return new web3.eth.Contract(LuckyMachineFactory.abi, address);
};
