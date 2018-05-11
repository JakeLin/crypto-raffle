import React, { Component } from 'react';
import Web3 from 'web3';

import logo from './logo.svg';
import './App.css';

const { abi } = require('./contracts/Raffle.json');

const address = '0x2529e5993f752c9d50fe43b8df45e8574817c7dd';

class App extends Component {
  state = {
    owner: '',
    players: [],
    balance: '',
    accounts: [],
    hasError: false,
    message: '',
    numberOfRaffle: '',
    contractLoaded: false
  };

  async componentDidMount() {
    try {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof window.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider.
        const web3 = new Web3(window.web3.currentProvider);
        console.log('Web3 Detected! ' + web3.currentProvider.constructor.name);

        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          this.setState({ hasError: true, message: 'Please sign in MetaMask and refresh the page!' });
          return;
        }

        const raffle = new web3.eth.Contract(abi, address)
        const owner = await raffle.methods.owner().call();
        const players = await raffle.methods.getPlayers().call();
        const contractAddress = raffle.options.address;
        const balanceInWei = await web3.eth.getBalance(contractAddress);
        const balance = web3.utils.fromWei(balanceInWei);
        this.setState({ web3, raffle, owner, players, contractAddress, balance, accounts, contractLoaded: true });
      } else {
        console.log('No Web3 Detected!');
        this.setState({ hasError: true, message: 'Please install MetaMask to use this app!' });
      }
    } catch(e) {
      console.error(e);
      this.setState({ hasError: true, message: 'Something went wrong!' });
    }
  }

  renderContractInfo = () => {
    if (this.state.contractAddress) {
      const url = `//ropsten.etherscan.io/address/${this.state.contractAddress}`
      return (
        <div>
          <div> Contract address: <a href={url} target="_blank">{this.state.contractAddress}</a> </div>
          <div> Contract balance: <b>{this.state.balance} ether</b> </div>
        </div>
      );
    }

    return (
      <span> Loading contract info... </span>
    );
  }

  renderMessage() {
    return (
      this.state.hasError ? <p className="error-message">{this.state.message}</p> : <b>{this.state.message}</b>
    );
  }

  onEntriesInputChange = event => {
    const value = Math.trunc(event.target.value);
    this.setState({ numberOfRaffle: value })
  }

  onBuySubmit = async event => {
    event.preventDefault();
    if (this.state.numberOfRaffle <= 0) {
      this.setState({ hasError: true, message: 'Entries must be greater than 0!' });
      return;
    }

    this.setState({ hasError: false, message: 'Waiting on transaction success...' });

    try {
      const ether = (this.state.numberOfRaffle * 0.01).toString();
      await this.state.raffle.methods.buy().send({
        from: this.state.accounts[0],
        value: this.state.web3.utils.toWei(ether, 'ether')
      });

      // Refresh the balance
      const balanceInWei = await this.state.web3.eth.getBalance(this.state.contractAddress);
      const balance = this.state.web3.utils.fromWei(balanceInWei);
      this.setState({ balance });

    } catch(e) {
      console.error(e);
      this.setState({ hasError: true, message: 'Something went wrong!' });
      return;
    }
    
    this.setState({ hasError: false, message: 'You are in, good luck!' });
  };

  onPickWinnerSubmit = async event => {
    event.preventDefault();
    if (this.state.balance === '0') {
      this.setState({ hasError: true, message: 'No ether in the contract!' });
      return;
    }

    this.setState({ hasError: false, message: 'Waiting on transaction success...' });

    try {
      await this.state.raffle.methods.pickWinner().send({
        from: this.state.accounts[0]
      });

      // Refresh the balance
      const balanceInWei = await this.state.web3.eth.getBalance(this.state.contractAddress);
      const balance = this.state.web3.utils.fromWei(balanceInWei);
      this.setState({ balance });

    } catch(e) {
      console.error(e);
      this.setState({ hasError: true, message: 'Something went wrong!' });
      return;
    }

    this.setState({ hasError: false, message: 'Ether has transferred to the winner!' });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Crypto Raffle</h1>
        </header>
        <div>
          <div className="account-info">{this.renderContractInfo()}</div>
          <form className={this.state.contractLoaded ? "" : "hidden"} onSubmit={this.onBuySubmit}>
            <h4>Try your luck, 0.01 ether per raffle</h4>
            <div>
              <label>Amount of entries to buy: 
                <input
                  className="entry-input"
                  type="number"
                  placeholder="e.g. 1, 3, or 10"
                  required="true"
                  value={this.state.numberOfRaffle}
                  onChange={this.onEntriesInputChange}/>
              </label>
            </div>
            <button className="button">Buy</button>
          </form>

          <form className={this.state.contractLoaded ? "" : "hidden"} onSubmit={this.onPickWinnerSubmit}>
            <h4>Owner of the contract</h4>
            <button className="button pick-winner">Pick the winner</button>
          </form>
          <div className="message">{this.renderMessage()}</div>
        </div>
      </div>
    );
  }
}

export default App;