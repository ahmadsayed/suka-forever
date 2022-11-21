//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

import "@openzeppelin/contracts/token/common/ERC2981.sol";


contract SukaNFT is Ownable, ERC721Enumerable, ERC2981{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public constant maxSupply = 10000;
    constructor() ERC721("SukaNFT", "SUKA") {}

    function mintNFT(address recipient)
        public onlyOwner
        returns (uint256)
    {
        require (totalSupply() < maxSupply, "Reached NFT max supply");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setDefaultRoyalty(recipient, 20);
        return newItemId;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://QmZD3o5HmeKYCsuFBknp1bWfcS48EMKRWPMrvWPhKNT6Y6/";
    }

    function totalSupply() public view override returns (uint256 supply) {
        return _tokenIds.current();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, ERC2981) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }

}
