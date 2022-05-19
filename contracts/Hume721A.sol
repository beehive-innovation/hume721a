// SPDX-License-Identifier: CAL

pragma solidity 0.8.14;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Hume721A is ERC721A, Ownable {
    string public baseURI;

    event Initialize(
        string name_,
        string symbol_,
        string baseURI_,
        uint256 quantity_,
        address owner_
    );

    event BaseURIChanged(string baseURI);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 quantity_
    ) ERC721A(name_, symbol_) {
        _safeMint(owner(), quantity_);
        baseURI = baseURI_;
        emit Initialize(name_, symbol_, baseURI_, quantity_, owner());
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
}
