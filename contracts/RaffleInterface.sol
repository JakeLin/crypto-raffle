pragma solidity ^0.4.23;

contract RaffleInterface {
    address public owner;
    function buy() external payable;
    function getPlayers() external view returns (address[]);
    function pickWinner() external;
}
