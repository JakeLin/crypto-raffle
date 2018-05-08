const Web3 = require('web3');
web3 = new Web3(web3.currentProvider);

const { abi, bytecode } = require('../build/contracts/Raffle.json');

describe('Raffle', async () => {
    let raffle;
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        raffle = await new web3.eth.Contract(abi)
            .deploy({ data: bytecode })
            .send({ from: accounts[0], gas: '1000000' });
    });

    it('should deploy the contract', () => {
        assert.ok(raffle.options.address);
    });

    it('the owner should be the first account', async () => {
        const owner = await raffle.methods.owner().call();
        assert.equal(owner, accounts[0]);
    });

    context('single player with single entry', () => {
        beforeEach(async () => {
            await raffle.methods.buy().send({
                from: accounts[0], 
                value: web3.utils.toWei('0.01', 'ether')
            });
        });

        it('should have a single player', async () => {
            const players = await raffle.methods.getPlayers().call()
            assert.equal(accounts[0], players[0]);
            assert.equal(1, players.length);
        });
    });

    context('single player with multiple entries', () => {
        beforeEach(async () => {
            await raffle.methods.buy().send({
                from: accounts[0], 
                value: web3.utils.toWei('0.03', 'ether'),
                gas: '1000000'
            });
        });

        it('should have three players', async () => {
            const players = await raffle.methods.getPlayers().call()
            assert.equal(accounts[0], players[0]);
            assert.equal(accounts[0], players[1]);
            assert.equal(accounts[0], players[2]);
            assert.equal(3, players.length);
        });
    });

    context('multiple players with multiple entries', () => {
        beforeEach(async () => {
            await raffle.methods.buy().send({
                from: accounts[0], 
                value: web3.utils.toWei('0.01', 'ether'),
                gas: '1000000'
            });

            await raffle.methods.buy().send({
                from: accounts[1], 
                value: web3.utils.toWei('0.01', 'ether'),
                gas: '1000000'
            });

            await raffle.methods.buy().send({
                from: accounts[2], 
                value: web3.utils.toWei('0.01', 'ether'),
                gas: '1000000'
            });
        });

        it('should have three different players', async () => {
            const players = await raffle.methods.getPlayers().call()
            assert.equal(accounts[0], players[0]);
            assert.equal(accounts[1], players[1]);
            assert.equal(accounts[2], players[2]);
            assert.equal(3, players.length);
        });
    });

    context('pick winner', () => {
        context('when no players buy', () => {
            it('the owner can not pick winner either', async () => {
                try {
                    await raffle.methods.pickWinner().send({
                      from: accounts[0]
                    });
                    assert(false);
                } catch (err) {
                    assert(err);
                }
            });
        });

        context('some players buy', () => {
            beforeEach(async () => {
                await raffle.methods.buy().send({
                    from: accounts[1], 
                    value: web3.utils.toWei('0.01', 'ether')
                });
            });
    
            it('the owner can pick winner', async () => {
                await raffle.methods.pickWinner().send({
                    from: accounts[0]
                });
                assert(true);
            });
    
            it('the others (not the owner) can not pick winner', async () => {
                try {
                    await raffle.methods.pickWinner().send({
                      from: accounts[1]
                    });
                    assert(false);
                } catch (err) {
                    assert(err);
                }
            });

            it('should send the money back to the winner', async () => {
                const initialBalance = await web3.eth.getBalance(accounts[1]);
                await raffle.methods.pickWinner().send({ from: accounts[0] });
                const finalBalance = await web3.eth.getBalance(accounts[1]);
                const difference = finalBalance - initialBalance;
                assert.equal(difference, web3.utils.toWei('0.01', 'ether'));
            });

            it('should reset the players', async () => {
                await raffle.methods.pickWinner().send({ from: accounts[0] });
                const players = await raffle.methods.getPlayers().call()
                assert.equal(0, players.length);
            });
        });
    });
});
