var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "glimpse kangaroo mosquito amazing play special awful fever indicate expect sad refuse";
var infuraKey = "G1fuKIoHFyYTjHqpzkL7";

module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infuraKey)
      },
      network_id: 3,
      gas: 2900000,
      gasPrice: 100000000000
    }
  }
};
