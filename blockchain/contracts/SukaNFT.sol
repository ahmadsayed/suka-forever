//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract SukaNFT is Ownable, ERC721Enumerable {
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

        return newItemId;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://QmSJGe26DsiRLfM7tryKTFcr1WY81YWMrVFRpRj3TjU8GM/";
    }

    function totalSupply() public view override returns (uint256 supply) {
        return _tokenIds.current();
    }
}
