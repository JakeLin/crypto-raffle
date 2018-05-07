const Raffle = artifacts.require('./Raffle.sol');

contract('Raffle', async (accounts) => {
    let raffle;
    beforeEach(async () => {
        raffle = await Raffle.deployed();
    });
    
    context('constuctor', () => {
        it('the owner should be the first account', async () => {
            const owner = await raffle.owner.call();
            assert.equal(owner, accounts[0]);
        });    
    });

    context('single player with single entry', () => {
        beforeEach(async () => {
            console.log(raffle.buy);
            console.log(web3);
            raffle.buy( {from: accounts[0]} );
        });

        it('should have a single player', async () => {
            const players = await raffle.players.call()
            assert.equal(accounts[0], players[0]);
            assert.equal(1, players.length);
        });
    });
});
