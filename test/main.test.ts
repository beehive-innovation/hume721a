const { expect }  = require("chai");
const { ethers } = require("hardhat");

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Hume721A } from "../typechain/Hume721A"
import { ReserveTokenERC721 } from "../typechain/ReserveTokenERC721"
import { expectRevert } from "@openzeppelin/test-helpers";

export let hume721a: Hume721A

export let erc721: ReserveTokenERC721
export let signer1: SignerWithAddress,
  winner1: SignerWithAddress,
  winner2: SignerWithAddress,
  winner3: SignerWithAddress,
  winner4: SignerWithAddress

let name = "HUME";
let symbol = "HM";
let quantity = 50;
let baseURI = "OLD_BASE_URI";

before(async () => {
  const signers = await ethers.getSigners();
  signer1 = signers[0];
  winner1 = signers[1];
  winner2 = signers[2];
  winner3 = signers[3];
  winner4 = signers[4];


  const contract = await ethers.getContractFactory("Hume721A");
  
  hume721a = await contract.deploy(name, symbol, baseURI, quantity);
  await hume721a.deployed();

  const ERC721 = await ethers.getContractFactory("ReserveTokenERC721");
  erc721 = await ERC721.deploy("BAYC", "Bored");
  await erc721.deployed();

})

describe("Hume721a test", () => {
    it("Should deploy Rume721a contract", async () => {
        expect(hume721a.address).to.be.not.null;
        expect(await hume721a.totalSupply()).to.equals(50);

        // for(let i=0;i<50;i++){
        //   await erc721.mintNewToken();
        // }

        // await hume721a.mint(50);
    });

    it("50 nfts whould be owned by owner", async () => {
      let owner = await hume721a.owner();
      expect(owner).to.equal(signer1.address);
      // expect(await hume721a.balanceOf(signer1.address)).to.deep.equals(ethers.BigNumber.from(50));
      expect(await hume721a.ownerOf(1)).to.equals(signer1.address);
      expect(await hume721a.ownerOf(11)).to.equals(signer1.address);
      expect(await hume721a.ownerOf(21)).to.equals(signer1.address);
      expect(await hume721a.ownerOf(31)).to.equals(signer1.address);
      expect(await hume721a.ownerOf(41)).to.equals(signer1.address);
      expect(await hume721a.ownerOf(50)).to.equals(signer1.address);
    })

    it("Should transfer Nfts",async () => {
      await hume721a.transferFrom(signer1.address, winner1.address, 1);
      await hume721a.transferFrom(signer1.address, winner2.address, 2);
      await hume721a.transferFrom(signer1.address, winner3.address, 3);
      await hume721a.transferFrom(signer1.address, winner4.address, 4);

      expect(await hume721a.ownerOf(1)).to.equals(winner1.address);
      expect(await hume721a.ownerOf(2)).to.equals(winner2.address);
      expect(await hume721a.ownerOf(3)).to.equals(winner3.address);
      expect(await hume721a.ownerOf(4)).to.equals(winner4.address);
    })

    it("Should test baseURI change",async () => {
      expect(await hume721a.tokenURI(1)).to.equals("OLD_BASE_URI");
      expect(await hume721a.tokenURI(11)).to.equals("OLD_BASE_URI");
      expect(await hume721a.tokenURI(21)).to.equals("OLD_BASE_URI");
      expect(await hume721a.tokenURI(41)).to.equals("OLD_BASE_URI");

      await hume721a.setBaseURI("NEW_BASE_URI");

      expect(await hume721a.tokenURI(1)).to.equals("NEW_BASE_URI");
      expect(await hume721a.tokenURI(11)).to.equals("NEW_BASE_URI");
      expect(await hume721a.tokenURI(21)).to.equals("NEW_BASE_URI");
      expect(await hume721a.tokenURI(41)).to.equals("NEW_BASE_URI");
    })
});

describe("Negative testing", () => {
  it("TokenId 0 must not be owned", async () => {
    await expectRevert(hume721a.ownerOf(0), "OwnerQueryForNonexistentToken()");
  })

  it(`Total supply must be ${quantity}`,async () => {
    expect(await hume721a.totalSupply()).to.equals(quantity);
  })

  it("Should fail to update the BaseURI by non owner", async () => {
      await expectRevert(hume721a.connect(winner1).setBaseURI("Fail."), "Ownable: caller is not the owner");
      expect(await hume721a.baseURI()).to.equals("NEW_BASE_URI");
  })
});