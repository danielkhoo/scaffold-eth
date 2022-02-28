//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//https://github.com/austintgriffith/scaffold-eth/tree/simple-stream
contract ISimpleStream {
    address public toAddress;

    function streamBalance() public view returns (uint256) {}
}

// https://github.com/ensdomains/reverse-records/blob/master/contracts/ReverseRecords.sol
contract ReverseRecords {
    function getNames(address[] calldata addresses)
        external
        view
        returns (string[] memory r)
    {}
}

contract BuidlGuidlTabard is ERC721 {
    // ENS Reverse Record Contract for address => ENS resolution
    ReverseRecords ensReverseRecords =
        ReverseRecords(0x97843608a00e2bbc75ab0C1911387E002565DEDE);

    constructor() ERC721("BuidlGuidl Tabard", "BGV3") {}

    function mintItem(address streamAddress) public {
        ISimpleStream stream = ISimpleStream(streamAddress);
        require(
            msg.sender == stream.toAddress(),
            "Stream does connect to your address"
        );
        _mint(msg.sender, uint256(uint160(msg.sender)));
    }

    // Checks ENS reverse records if address has an ens name, else returns blank string
    function lookupENSName(address addr) public view returns (string memory) {
        address[] memory t = new address[](1);
        t[0] = addr;
        string[] memory results = ensReverseRecords.getNames(t);
        return results[0];
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        return _buildTokenURI(id);
    }

    // Converts wei to ether string with 2 decimal places
    function weiToEtherString(uint256 amountInWei)
        public
        pure
        returns (string memory)
    {
        uint256 amountInFinney = amountInWei / 1e15; // 1 finney == 1e15
        uint256 leftOfDecimal = amountInFinney / 1000;
        uint256 firstDecimal = (amountInFinney % 1000) / 100;
        uint256 secondDecimal = ((amountInFinney % 1000) % 100) / 10;
        return
            string(
                abi.encodePacked(
                    Strings.toString(leftOfDecimal),
                    ".",
                    Strings.toString(firstDecimal),
                    Strings.toString(secondDecimal)
                )
            );
    }

    function _buildTokenURI(uint256 id) internal view returns (string memory) {
        address boundAddress = address(uint160(id));

        // string memory ENSName = lookupENSName(boundAddress);

        string memory balanceString = weiToEtherString(boundAddress.balance);

        string memory metaSVG = string(
            abi.encodePacked(
                '<rect width="400" height="400" fill="#ffffff" />',
                '<text class="h1" x="60" y="60" >Knight of the</text>',
                '<text class="h1" x="90" y="110" >BuidlGuidl</text>',
                unicode'<text x="70" y="230" style="font-size:100px;">🏗️ 🏰</text>',
                unicode'<text x="15" y="300">Stream Ξ',
                "0.42",
                "</text>",
                unicode'<text x="210" y="300" >Wallet Ξ',
                balanceString,
                "</text>",
                '<text x="15" y="350" style="font-size:28px;"> ',
                "jadenkore.eth",
                "</text>",
                '<text x="15" y="380" id="address" style="font-size:14px;">',
                addressToString(boundAddress),
                "</text>"
            )
        );
        bytes memory svg = abi.encodePacked(
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">',
            '<style type="text/css"><![CDATA[text { font-family: Monaco , sans-serif; font-size: 21px;} .h1 {font-size: 36px;}]]></style>',
            metaSVG,
            "</svg>"
        );
        bytes memory image = abi.encodePacked(
            "data:image/svg+xml;base64,",
            Base64.encode(bytes(svg))
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"BuidlGuidl Tabard", "image":"',
                                image,
                                '", "description": "This NFT marks the bound address as a member of the BuidlGuidl."}'
                            )
                        )
                    )
                )
            );
    }

    function addressToString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}

/// @notice Provides a function for encoding some bytes in base64.
/// @author Modified from Brecht Devos (https://github.com/Brechtpd/base64/blob/main/base64.sol)
/// License-Identifier: MIT
library Base64 {
    bytes internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @dev encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(input, 0x3F))), 0xFF)
                )
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
