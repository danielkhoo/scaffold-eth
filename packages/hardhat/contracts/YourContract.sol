pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract YourContract {
    event RegisterCertificate(
        address sender,
        address certHash,
        string certName
    );
    event CertifyUser(address userAddress, address certHash);

    struct CertificateInfo {
        string name;
        address admin;
    }

    // Maps quiz hash => quiz info
    mapping(address => CertificateInfo) public certInfo;

    // Maps user achievements
    mapping(address => mapping(address => bool)) certCompletion;

    // Maps active certs
    mapping(address => address) public activeCert;

    // register a certificate
    function register(string memory certName) public returns (address) {
        address certHash = generateCertHash();

        certInfo[certHash].name = certName;
        certInfo[certHash].admin = msg.sender;

        emit RegisterCertificate(msg.sender, certHash, certName);

        activeCert[msg.sender] = certHash;
        return certHash;
    }

    function certifyAddress(address userAddress, address certHash) public {
        require(
            certInfo[certHash].admin == msg.sender,
            "Not the admin of cert"
        );

        certCompletion[userAddress][certHash] = true;

        emit CertifyUser(userAddress, certHash);
    }

    function getCertStatus(address userAddress, address certHash)
        public
        view
        returns (bool result)
    {
        return certCompletion[userAddress][certHash];
    }

    function generateCertHash() public view returns (address) {
        bytes32 prevHash = blockhash(block.number - 1);
        // Cert hash is a pseudo-randomly generated address from last blockhash + sender
        return
            address(bytes20(keccak256(abi.encodePacked(prevHash, msg.sender))));
    }
}
