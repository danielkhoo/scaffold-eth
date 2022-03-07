pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaMultiSigWallet is Ownable {
    using ECDSA for bytes32;

    uint256 public nonce;
    string public purpose = "hello there";

    function setPurpose(string memory newPurpose) public {
        purpose = newPurpose;
    }

    function executeTransaction(
        address payable to,
        uint256 value,
        bytes memory data,
        bytes memory signature
    ) public returns (bytes memory) {
        bytes32 txnHash = getTransactionHash(nonce, to, value, data);
        nonce++;

        address signer = recover(txnHash, signature);
        require(signer == owner(), "SIGNER MUST BE OWNER");

        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "executeTransaction: tx failed");

        return result;
    }

    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory data
    ) public view returns (bytes32) {
        return
            keccak256(abi.encodePacked(address(this), _nonce, to, value, data));
    }

    function recover(bytes32 hash, bytes memory signature)
        public
        pure
        returns (address)
    {
        return hash.toEthSignedMessageHash().recover(signature);
    }

    // to support receiving ETH by default
    receive() external payable {}

    fallback() external payable {}
}
