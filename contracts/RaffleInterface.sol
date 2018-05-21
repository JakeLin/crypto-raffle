pragma solidity ^0.4.23;

interface RaffleInterface {
    function buy() external payable;
    function getPlayers() external view returns (address[]);
    function pickWinner() external;
}
