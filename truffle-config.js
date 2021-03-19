const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const mnemonic = process.env.MNEMONIC;
const kovan_url = process.env.RPC_URL_KOVAN;
const mumbai_url = process.env.RPC_URL_MUMBAI;
const matic_url = process.env.RPC_URL_MATIC;

module.exports = {
  networks: {
    cldev: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(mnemonic, kovan_url);
      },
      network_id: "42",
      skipDryRun: true,
    },
    matic: {
      provider: () => {
        return new HDWalletProvider(mnemonic, matic_url);
      },
      network_id: "137",
    },
    mumbai: {
      provider: () => {
        return new HDWalletProvider(mnemonic, mumbai_url);
      },
      network_id: "80001",
    },
  },
  compilers: {
    solc: {
      version: "0.6.12",
    },
  },
};
