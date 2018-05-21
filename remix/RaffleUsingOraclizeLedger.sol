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
        oraclize_setProof(proofType_Ledger);
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

        uint N = players.length; // number of random bytes we want the datasource to return
        uint delay = 0; // number of seconds to wait before the execution takes place
        uint callbackGas = 200000; // amount of gas we want Oraclize to set for the callback function
        // this function internally generates the correct oraclize_query and returns its queryId
        bytes32 queryId = oraclize_newRandomDSQuery(delay, N, callbackGas);
        validIds[queryId] = true;
    }

    // the callback function is called by Oraclize when the result is ready
    // the oraclize_randomDS_proofVerify modifier prevents an invalid proof to execute this function code:
    // the proof validity is fully verified on-chain
    function __callback(bytes32 _queryId, string _result, bytes _proof) public
    { 
        // only allow Oraclize to call this function
        require(msg.sender == oraclize_cbAddress());
        // validate the ID 
        require(validIds[_queryId]);
        
        if (oraclize_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            // the proof verification has failed, do we need to take any action here? (depends on the use case)
        } else {
            // the proof verification has passed
            // now that we know that the random number was safely generated, let's use it..

            // for simplicity of use, let's also convert the random bytes to uint if we need
            uint maxRange = 2 ** (players.length.mul(8)); 
            // this is the highest uint we want to get. It should never be greater than 2^(8*N), where N is the number of random bytes we had asked the datasource to return
            uint randomNumber = uint(keccak256(_result)) % maxRange; // this is an efficient way to get the uint out in the [0, maxRange] range
            
            uint index = randomNumber % players.length;
            players[index].transfer(address(this).balance);
            players = new address[](0);

            validIds[_queryId] = false;
        }
    }
}
