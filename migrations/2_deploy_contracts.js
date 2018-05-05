var Raffle = artifacts.require("./Raffle.sol");

module.exports = function(deployer) {
  deployer.deploy(Raffle);
};
