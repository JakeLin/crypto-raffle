pragma solidity ^0.4.20;

import "github.com/oraclize/ethereum-api/oraclizeAPI_0.5.sol";

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        assert(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        assert(c >= a);
        return c;
    }
}

contract RaffleUsingOraclize is usingOraclize {
    using SafeMath for uint;
    
    address public owner;
    address[] private players;
    mapping(bytes32=>bool) validIds;

    function RaffleUsingOraclize() public {
        owner = msg.sender;
    }

    function buy() external payable {
        require(msg.value >= .01 ether);
        uint numberOfeEtries = msg.value.div(.01 ether);
        for (uint index = 0; index < numberOfeEtries; index++) {
            players.push(msg.sender);
        }
    }

    function getPlayers() external view returns (address[]) {
        return players;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function pickWinner() external onlyOwner {
        require(players.length > 0);

        uint callbackGas = 200000; // amount of gas we want Oraclize to set for the callback function
        bytes32 queryId = oraclize_query(
            "WolframAlpha", 
            "random number 0 to 2^256",
            callbackGas
            );
        validIds[queryId] = true;
    }

    // Callback function for Oraclize once it retreives the data 
    function __callback(bytes32 _queryId, string _result, bytes _proof) public { 
        // only allow Oraclize to call this function
        require(msg.sender == oraclize_cbAddress());
        // validate the ID 
        require(validIds[_queryId]);

        uint randomNumber = parseInt(_result);
        uint index = randomNumber % players.length;
        players[index].transfer(address(this).balance);
        players = new address[](0);

        validIds[_queryId] = false;
    }
}
