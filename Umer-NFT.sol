// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@5.0.1/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@5.0.1/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@5.0.1/access/Ownable.sol";

contract UmerNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
     uint256 public mintRate=0.0000001 ether;
    uint public MAXSUPPLY =1000;
     uint256 public tokenId ;
     uint256 public totalSupply=0;

    constructor(address initialOwner)
        ERC721("Umer's  NFT", "UNFT")
        Ownable(initialOwner)
    {}

  

    function safeMint(address to, string memory uri) public payable  {
          require(msg.value >= mintRate,"Not enough ethers");
          tokenId = _nextTokenId++;
          totalSupply++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenID)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenID);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
     function withdraw() public onlyOwner{
        require(address(this).balance> 0,"balance is 0");
        payable(owner()).transfer(address(this).balance);
    }
}
