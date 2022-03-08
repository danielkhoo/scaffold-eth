pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MetaMultiSigWallet {
    using ECDSA for bytes32;

    event Signer(address indexed owner, bool added);
    mapping(address => bool) public isSigner;
    uint256 public signaturesRequired;
    uint256 public nonce;
    uint256 public chainId;
    mapping(uint256 => string) public transactions;

    constructor(
        uint256 _chainId,
        address[] memory _signers,
        uint256 _signaturesRequired
    ) {
        require(
            _signaturesRequired > 0,
            "constructor: signatures required must be non-zero"
        );
        signaturesRequired = _signaturesRequired;
        for (uint256 i = 0; i < _signers.length; i++) {
            address signer = _signers[i];
            require(!isSigner[signer], "constructor: owner not unique");
            isSigner[signer] = true;
            emit Signer(signer, isSigner[signer]);
        }
        chainId = _chainId;
    }

    /// All write functions are gated by onlySelf, forcing them to be run via
    /// executeFunction, this enforces min number of signers on all operations
    modifier onlySelf() {
        require(msg.sender == address(this), "Not Self");
        _;
    }

    function addSigner(address newSigner, uint256 newSignaturesRequired)
        public
        onlySelf
    {
        require(!isSigner[newSigner], "addSigner: address already a signer");
        require(
            newSignaturesRequired > 0,
            "addSigner: must be non-zero sigs required"
        );
        isSigner[newSigner] = true;
        signaturesRequired = newSignaturesRequired;
        emit Signer(newSigner, isSigner[newSigner]);
    }

    function removeSigner(address oldSigner, uint256 newSignaturesRequired)
        public
        onlySelf
    {
        require(isSigner[oldSigner], "removeSigner: only callable by signer");
        require(
            newSignaturesRequired > 0,
            "removeSigner: must be non-zero sigs required"
        );
        isSigner[oldSigner] = false;
        signaturesRequired = newSignaturesRequired;
        emit Signer(oldSigner, isSigner[oldSigner]);
    }

    function updateSignaturesRequired(uint256 newSignaturesRequired)
        public
        onlySelf
    {
        require(newSignaturesRequired > 0, "updateSignaturesRequired: min 1");
        signaturesRequired = newSignaturesRequired;
    }

    /// @notice Generalised transaction execution via signed transactions with
    /// calldata enforces the min number of signers.
    function executeTransaction(
        address payable to,
        uint256 value,
        bytes memory data,
        bytes[] memory signatures
    ) public returns (bytes memory) {
        require(isSigner[msg.sender], "executeTransaction: not signer");

        bytes32 txnHash = getTransactionHash(nonce, to, value, data);
        nonce++;

        uint256 validSignatures;
        address duplicateGuard;
        for (uint256 i = 0; i < signatures.length; i++) {
            address recoveredSigner = recover(txnHash, signatures[i]);
            require(
                recoveredSigner > duplicateGuard,
                "executeTransaction: duplicate or unordered signatures"
            );
            duplicateGuard = recoveredSigner;
            if (isSigner[recoveredSigner]) {
                validSignatures++;
            }
        }

        require(
            validSignatures >= signaturesRequired,
            "executeTransaction: not enough valid signatures"
        );

        (bool success, bytes memory result) = to.call{value: value}(data);
        require(success, "executeTransaction: tx failed");

        return result;
    }

    function createTransaction(string memory jsonString) public {
        transactions[nonce] = jsonString;
    }

    function getTransactions(uint256 _nonce)
        public
        view
        returns (string memory)
    {
        return transactions[_nonce];
    }

    /* ========== HELPER FUNCTIONS ========== */

    /// @notice Generates the txn hash with the contract address, nonce, toAddress, value and calldata
    function getTransactionHash(
        uint256 _nonce,
        address to,
        uint256 value,
        bytes memory data
    ) public view returns (bytes32) {
        return
            keccak256(abi.encodePacked(address(this), _nonce, to, value, data));
    }

    /// @notice Recovers the address of the signer for a hash and signature
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
