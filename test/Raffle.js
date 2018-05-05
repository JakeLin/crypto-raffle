const Raffle = artifacts.require('./Raffle.sol');

contract('Raffle', async function(accounts) {
    it('the owner should be the first account', async function() {
        let raffle = await Raffle.deployed();
        let owner = await raffle.owner.call();
        assert.equal(owner, accounts[0]);
    });
});
