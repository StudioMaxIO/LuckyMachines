import web3 from "./web3";
import LuckyMachineJackpot from "@luckymachines/contracts/abi/v0.2/LuckyMachineJackpot.json";

const LM = (address) => {
  return new web3.eth.Contract(LuckyMachineJackpot.abi, address);
};

export default LM;
