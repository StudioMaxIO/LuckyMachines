import web3 from "./web3";
import Jackpots from "@luckymachines/contracts/abi/v0.2/Jackpots.json";

const J = (address) => {
  return new web3.eth.Contract(Jackpots.abi, address);
};

export default J;
