//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import "hardhat/console.sol";

contract ReverseRecords {
    function getNames(address[] calldata addresses)
        external
        view
        returns (string[] memory r)
    {
        r = new string[](addresses.length);
        for (uint256 i = 0; i < addresses.length; i++) {
            if (addresses[i] != address(0x0)) {
                r[i] = "jadenkore.eth";
            }
        }
        return r;
    }
}
