// SPDX-License-Identifier: CAL

pragma solidity 0.8.14;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct DeployConfig {
    string name;
    string symbol;
    string baseURI;
    uint256 quantity;
    address recipient;
}

contract Hume721A is ERC721A, Ownable {
    string public baseURI;

    event Initialize(DeployConfig config, address sender);

    event BaseURIChanged(string baseURI);

    constructor(DeployConfig memory config_, address sender)
        ERC721A(config_.name, config_.symbol)
    {
        _safeMint(config_.recipient, config_.quantity);
        baseURI = config_.baseURI;
        transferOwnership(sender);
        emit Initialize(config_, sender);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
        emit BaseURIChanged(baseURI_);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        return baseURI;
    }

    function airDrop(address[] memory addresses, uint256[] memory ids) public {
        require(addresses.length == ids.length, "Invalid arrays.");
        for (uint256 i = 0; i < ids.length; i++) {
            safeTransferFrom(msg.sender, addresses[i], ids[i]);
        }
    }
}
