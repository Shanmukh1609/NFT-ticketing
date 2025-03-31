// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Organizers is ERC721URIStorage, Ownable {

    struct Organiser {
        address orgAddress;
        string organizationName;
    }

    mapping(address => bool) public isOrganiser;
    mapping(address => Organiser) public members;

    Organiser[] public organisations;
    uint256 private organiserCount;
    uint256 private tokenIds = 0;

    constructor() ERC721("NFT_MINTING", "NFTM") Ownable (msg.sender){
        organiserCount = 0;
    }

    function register(string memory name) public {
        address orgAddress = msg.sender;
        require(!isOrganiser[orgAddress], "Already an Organiser");

        members[orgAddress] = Organiser(orgAddress, name);
        isOrganiser[orgAddress] = true;
        organisations.push(members[orgAddress]); // ✅ Fixed array push
        organiserCount++;
    }

    function getOrganisersCount() public view returns (uint256) {
        return organiserCount;
    }
    event NFTMinted(address indexed owner, uint256 tokenId);

    function getOrganiser() public view returns (string memory) {
        address orgAddress = msg.sender;
        require(isOrganiser[orgAddress], "Not an Organiser");
        return members[orgAddress].organizationName;
    }

    function mintNFT(string memory URI) public  {
        address to = msg.sender;
        require(isOrganiser[to], "Not an Organiser");

        tokenIds++;
        uint256 newItemId = tokenIds;
        _safeMint(to, newItemId);
        _setTokenURI(newItemId, URI); // ✅ Fixed tokenURI issue
        
        // ✅ Emit event to confirm minting
    emit NFTMinted(to, newItemId);   
    }

    function getNFTDetails(uint256 tokenId) public view returns (string memory) {
        
        address sender = msg.sender;
        address ownerNFT= ownerOf(tokenId);
        require(sender == ownerNFT, "Not the owner of NFT");

        return tokenURI(tokenId);

    }




}
