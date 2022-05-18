const { expect }  = require("chai");
const { ethers } = require("hardhat");

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Hume721A } from "../typechain/Hume721A"

export let hume721a: Hume721A
export let signer1: SignerWithAddress,
  winner1: SignerWithAddress,
  winner2: SignerWithAddress,
  winner3: SignerWithAddress,
  winner4: SignerWithAddress

before(async () => {
  const signers = await ethers.getSigners();
  signer1 = signers[0];
  winner1 = signers[1];
  winner2 = signers[2];
  winner3 = signers[3];
  winner4 = signers[4];


  const contract = await ethers.getContractFactory("Hume721A");

  
  hume721a = await contract.deploy("HUME", "HM", "BASE_URI");
  await hume721a.deployed();

})

describe("Hume721a test", () => {
    it("Should deploy Rume721a contract", async () => {
        expect(hume721a.address).to.be.not.null;
    });

    it("50 nfts whould be owned by owner", async () => {
      let owner = await hume721a.owner();
      expect(owner).to.equal(signer1.address);
      expect(await hume721a.balanceOf(signer1.address)).to.deep.equals(ethers.BigNumber.from(50));
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
});