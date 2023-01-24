// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title SukaVerse
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract SukaVerse is ERC721Enumerable {
    /**
     * NFT  ERC721 state
     */
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCounts;
    mapping(uint256 => string) private _tokenURIs;

    /**
     * MetaVerse state
     * Addresses of Users who can edit this token
     */
    mapping(uint256 => address[]) public members;

    /**
     * ERC721 characteristics
     * 1- Unlimited Supply
     * 2- Mint are permissionless
     * 3- Only Owner can Burn
     * 4- Only Owner can add/remove team Memebr
     * 5- Only Owner or Editor can update the URI
     * 6- TODO: Viewer only mode can comments
     * 7- TODO: Retention policy for older version will use Filecoin deals
     * 8- TODO: Delegate Team Memeber as Admin
     * 9- TODO: Expose who made which change
     */
    constructor() ERC721("SukaVerse", "SUKA") {}

    function mintNFT(string memory _tokenURI, uint256 tokenId)
        public
        returns (uint256)
    {
        require(!_exists(tokenId), "ERC721URIStorage: tokenId already created");

        _tokenCounts.increment();

        uint256 newItemId = tokenId;
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        members[tokenId].push(msg.sender);

        return newItemId;
    }

    function totalSupply() public view override returns (uint256 supply) {
        return _tokenCounts.current();
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function updateTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _exists(tokenId),
            "ERC721URIStorage: URI set of nonexistent token"
        );
        require(
            _isTokenEditor(tokenId, msg.sender),
            "SUKAVerse: Only owner or Editor can Update the token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        require(
            _exists(tokenId),
            "ERC721URIStorage: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev See {ERC721-_burn}. This override additionally checks to see if a
     * token-specific URI was set for the token, and if so, it deletes the token URI from
     * the storage mapping.
     */
    function _burn(uint256 tokenId) internal virtual override {
        super._burn(tokenId);

        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
    }

    function _isTokenEditor(uint256 tokenId, address sender)
        internal
        view
        returns (bool)
    {
        bool isTeamMember = false;
        for (uint256 i = 0; i < members[tokenId].length; i++) {
            if (members[tokenId][i] == sender) {
                isTeamMember = true;
                break;
            }
        }
        return isTeamMember;
    }

    /**
     * @dev add new address to NFT editors`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `member` Wallet address of the new member
     *
     */
    function addEditor(uint256 tokenId, address editor) public {
        require(
            _exists(tokenId),
            "ERC721URIStorage: Add editor nonexistent token"
        );
        require(
            _ownerOf(tokenId) == msg.sender,
            "SUKAVerse: Only token owner can add memeber"
        );
        members[tokenId].push(editor);
    }

    /**
     * @dev Return value
     * @return value of 'address[]'
     */
    function listEditors(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        return members[tokenId];
    }
}
