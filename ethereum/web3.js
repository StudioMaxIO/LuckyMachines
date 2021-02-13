import Web3 from "web3";

let web3;

//if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // in browser and metamask is running
  web3 = new Web3(window.ethereum);
  window.ethereum.enable();
  window.ethereum.on("accountsChanged", function(accounts) {
    window.location.reload(false);
  });
  window.ethereum.on("chainChanged", function(_chainID) {
    window.location.reload();
  });
} else {
  // on the server or user is not running metamask
  const provider = new Web3.providers.HttpProvider(process.env.INFURA_API);
  web3 = new Web3(provider);
}

export default web3;
