pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract is Ownable {
    constructor() {}

    // ================= 1. Read / Update Values =================

    // Event that triggers when it gets emitted
    event SetPurpose(address sender, string purpose);

    // Simple string that we can modify
    string public part1_purpose = "Building Unstoppable Apps!!!";

    // Update the purpose string
    function part1_setPurpose(string memory newPurpose) public {
        part1_purpose = newPurpose;
        emit SetPurpose(msg.sender, part1_purpose);
    }

    /* */
    // ===========================================================

    // ================= 2. Deposit/Withdraw Funds =================
    /*
    mapping(address => uint256) public part2_balances;

    function part2_deposit() public payable {
        // Require that funds are included
        require(msg.value > 0, "No eth sent");

        part2_balances[msg.sender] += msg.value;
    }

    function part2_withdraw() public {
        // Require that user has a balance
        uint256 userBalance = part2_balances[msg.sender];
        require(userBalance > 0, "User balance is 0");

        // Zero user balance, BEFORE sending
        part2_balances[msg.sender] = 0;

        // Send user's deposit back to them, returns a boolean for success
        (bool sent, ) = msg.sender.call{value: userBalance}("");

        // Require that withdraw worked, else revert
        require(sent, "Failed to send user balance back to the owner");
    }

    // to support receiving ETH, treat it as a deposit
    receive() external payable {
        part2_deposit();
    }
*/
    // ===========================================================
    // ================= 2.1 Block time and timelocks =================
    /*  
    function part2_timeLockedWithdraw() public {
        // Check time remaining is 0
        uint256 timeRemaining = part2_timeLeft();
        require(timeRemaining == 0, "Timelock still in effect");

        part2_withdraw();
    }

    // Hard-coded time since the contract deployment + x number of minutes
    uint256 public part2_timeSinceDeploy = block.timestamp + 3 minutes;

    // Function to calculate the time left
    function part2_timeLeft() public view returns (uint256 timeRemaining) {
        if (block.timestamp >= part2_timeSinceDeploy) {
            return 0;
        } else {
            return part2_timeSinceDeploy - block.timestamp;
        }
    }
    */
    // ===========================================================

    // ================= 3. Commit / Reveal =================
    /*
    bytes32 public part3_commitHash;
    string public part3_revealMessage;

    function part3_commit(string memory message, string memory salt) public {
        part3_commitHash = keccak256(abi.encodePacked(message, salt));
    }

    function part3_reveal(string memory message, string memory salt) public {
        bytes32 checkHash = keccak256(abi.encodePacked(message, salt));

        require(
            checkHash == part3_commitHash,
            "Invalid reveal. Either message or salt does not match commit."
        );

        part3_revealMessage = message;
    }
    */
    // =======================================================

    // ================= 4. Signaure Recovery / Meta Transactions =================
    /* 
    using ECDSA for bytes32;

    uint256 public nonce = 0;

    function part4_getHash(address to, uint256 value)
        public
        view
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(address(this), nonce, to, value));
    }

    function part4_recover(bytes32 hash, bytes memory signature)
        public
        pure
        returns (address)
    {
        return hash.toEthSignedMessageHash().recover(signature);
    }

    function part4_executeSignedSend(
        address payable to,
        uint256 value,
        bytes memory signature
    ) public {
        bytes32 hash = part4_getHash(to, value);
        address signer = part4_recover(hash, signature);
        require(signer == owner(), "Recovered address match signer");
        nonce++;
        (bool success, ) = to.call{value: value}("");
        require(success, "TX FAILED");
    }

    receive() external payable {}
    */
    // =======================================================

    // ================= 5. ERC20 Approve Pattern =================
    /* 
    YourToken public yourToken;

    function part5_setTokenAddress(address tokenAddress) public {
        yourToken = YourToken(tokenAddress);
    }

    function part5_depositTokens(uint256 amountOfTokens) public {
        // Check some eth is sent
        require(amountOfTokens > 0, "No tokens sents");

        // Send user tokens
        yourToken.transferFrom(msg.sender, address(this), amountOfTokens);
    }
    */
    // =======================================================
}
