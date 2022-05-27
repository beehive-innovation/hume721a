import hre, { artifacts, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ConstructEvent,
  TokenURIEvent,
  TransferEvent,
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1
} from "../typechain/HumeAngelbabyCommunityEP1";
import { HumeAngelbabyCommunityEP1Factory } from "../typechain/HumeAngelbabyCommunityEP1Factory";
import { expectRevert } from "@openzeppelin/test-helpers";
import { assert, expect } from "chai";
import { fetchFile, getEventArgs, assertError } from "./utils";
import path from "path";
import { BigNumber } from "ethers";

export let angelBaby: HumeAngelbabyCommunityEP1
export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory

export let admin: SignerWithAddress,
  owner: SignerWithAddress, 
  recipient: SignerWithAddress, 
  factoryOwner: SignerWithAddress, 
  newFactoryOwner: SignerWithAddress;

export let ConstructorConfig: ConstructorConfigStruct;

export let deployTransaction;

before(async () => {
  const signers = await ethers.getSigners();
  admin = signers[0]
  owner = signers[1];
  recipient = signers[2];
  factoryOwner = signers[3];
  newFactoryOwner = signers[4];

  const AngelbabbyFactory = await ethers.getContractFactory("HumeAngelbabyCommunityEP1Factory");

  angelBabyFactory = await AngelbabbyFactory.connect(factoryOwner).deploy() as HumeAngelbabyCommunityEP1Factory;
})

describe("HumeAngelbabyCommunityEP1 Admin/Owner test", () => {
  describe("HumeAngelbabyCommunityEP1Factory Owner test", () => {
    it("Should deploy HumeAngelbabyCommunityEP1Factory",async () => {
      expect(angelBabyFactory.address).to.be.not.null;
    });
  
    it("HumeAngelbabyCommunityEP1Factory should be owned by Admin",async () => {
      expect(await angelBabyFactory.owner()).to.equals(factoryOwner.address);
    });
  
    it("Should transfer the ownership to another address.", async () => {
      let ownershipTransferTx = await angelBabyFactory.connect(factoryOwner).transferOwnership(newFactoryOwner.address);

      const { previousOwner, newOwner } = await getEventArgs(ownershipTransferTx, "OwnershipTransferred", angelBabyFactory);

      expect(await angelBabyFactory.owner()).to.equals(newFactoryOwner.address);
      expect(previousOwner).to.equals(factoryOwner.address);
      expect(newOwner).to.equals(newFactoryOwner.address);
    });

    it("Should fail to transfer ownerShip by non-owner address",async () => {
      await expect(angelBabyFactory.connect(factoryOwner).transferOwnership(factoryOwner.address)).to.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner shopuld be able to create child",async () => {
      let config: ConstructorConfigStruct= {
        name: "ANGELBABY",
        symbol: "AGBB",
        tokenURI: "OLD_TOKEN_URI",
        quantity: 100,
        admin: admin.address,
        owner: owner.address
      }

      let createChildTx = await angelBabyFactory.connect(newFactoryOwner).createChildTyped(config);

      const {sender, child} = await getEventArgs(createChildTx, "NewChild", angelBabyFactory);

      angelBaby = await ethers.getContractAt((await artifacts.readArtifact("HumeAngelbabyCommunityEP1")).abi, child) as HumeAngelbabyCommunityEP1;

      expect(sender).to.equals(angelBabyFactory.address);
      expect(angelBaby.address).to.equals(child);
      expect(await angelBaby.owner()).to.equals(owner.address, `Owner is ${angelBaby.owner()} not ${owner.address}`)
      expect(await angelBaby.admin()).to.equals(admin.address, `Owner is ${angelBaby.admin()} not ${admin.address}`)
    });
  });
});
//   it("should construct correctly", async () => {
//     // mints
//     const balanceOwner = await hume721a.balanceOf(recipient.address);
//     assert(balanceOwner.eq(deployConfig.quantity), "wrong quantity minted");
//     assert((await hume721a.owner()) == owner.address, "wrong owner");

//     const { from, to, tokenId } = (await getEventArgs(
//       tx,
//       "Transfer",
//       hume721a
//     )) as TransferEvent["args"];
//     assert(from === ethers.constants.AddressZero, "wrong minter");
//     assert(to === recipient.address, "wrong mintee");
//     assert(tokenId.eq(1), "wrong start token id");

//     // sets vars
//     assert(
//       (await hume721a.baseURI()) === deployConfig.baseURI,
//       "did not set baseURI"
//     );

//     // initializes
//     const { config, sender } = (await getEventArgs(
//       tx,
//       "Initialize",
//       hume721a
//     )) as InitializeEvent["args"];

//     assert(config.name === deployConfig.name, "incorrect name");
//     assert(config.symbol === deployConfig.symbol, "incorrect symbol");
//     assert(config.quantity.eq(deployConfig.quantity), "incorrect quantity");
//     assert(config.baseURI === deployConfig.baseURI, "incorrect baseURI");
//     assert(config.recipient === deployConfig.recipient, "incorrect owner");
//   });

//   it("Should deploy Hume721a contract", async () => {
//     assert(hume721a.address != ethers.constants.AddressZero);
//     assert((await hume721a.totalSupply()).eq(50));
//     await assertError(
//       async () =>
//         await hume721a.ownerOf(BigNumber.from(deployConfig.quantity).add(1)),
//       "OwnerQueryForNonexistentToken()",
//       "Allowed owner check for more IDs than minted."
//     );
//   });

//   it("50 nfts whould be owned by owner", async () => {
//     expect(await hume721a.balanceOf(recipient.address)).to.deep.equals(
//       ethers.BigNumber.from(50)
//     );
//     expect(await hume721a.ownerOf(1)).to.equals(recipient.address);
//     expect(await hume721a.ownerOf(11)).to.equals(recipient.address);
//     expect(await hume721a.ownerOf(21)).to.equals(recipient.address);
//     expect(await hume721a.ownerOf(31)).to.equals(recipient.address);
//     expect(await hume721a.ownerOf(41)).to.equals(recipient.address);
//     expect(await hume721a.ownerOf(50)).to.equals(recipient.address);
//   });

//   it("Should test baseURI change", async () => {
//     expect(await hume721a.tokenURI(1)).to.equals("OLD_BASE_URI");
//     expect(await hume721a.tokenURI(11)).to.equals("OLD_BASE_URI");
//     expect(await hume721a.tokenURI(21)).to.equals("OLD_BASE_URI");
//     expect(await hume721a.tokenURI(41)).to.equals("OLD_BASE_URI");

//     const txBaseURI = await hume721a.setBaseURI("NEW_BASE_URI");
//     const { baseURI: eventBaseURI_ } = (await getEventArgs(
//       txBaseURI,
//       "BaseURIChanged",
//       hume721a
//     )) as BaseURIChangedEvent["args"];

//     assert(
//       eventBaseURI_ === "NEW_BASE_URI",
//       "wrong baseURI in BaseURIChanged event"
//     );

//     expect(await hume721a.tokenURI(1)).to.equals("NEW_BASE_URI");
//     expect(await hume721a.tokenURI(11)).to.equals("NEW_BASE_URI");
//     expect(await hume721a.tokenURI(21)).to.equals("NEW_BASE_URI");
//     expect(await hume721a.tokenURI(41)).to.equals("NEW_BASE_URI");
//   });

//   it.only("Should transfer Nfts", async () => {
//     const pathAddresses = path.resolve(__dirname, `../config/addresses.json`);
//     const addresses = JSON.parse(fetchFile(pathAddresses));
//     console.log(addresses, `${addresses.length} addresses in json.`);

//     let ids: number[] = [];
//     for (let i = 1; i <= deployConfig.quantity; i++) {
//       ids.push(i);
//     }

//     let transfer = await hume721a.connect(recipient).airdrop(addresses);
//     await transfer.wait();

//     for (let i = 1; i <= deployConfig.quantity; i++) {
//       expect(await hume721a.ownerOf(i)).to.equals(addresses[i - 1]);
//     }
//   });
// });

// describe("Negative testing", () => {
//   it(`TokenId 0 and must not be owned`, async () => {
//     await assertError(
//       async () => await hume721a.ownerOf(0),
//       "OwnerQueryForNonexistentToken()",
//       "Allowed owner check for 0 ID."
//     );
//   });

//   it("Should fail to update the BaseURI by non owner", async () => {
//     await assertError(
//       async () => await hume721a.connect(recipient).setBaseURI("Fail."),
//       "Ownable: caller is not the owner",
//       "Allowed non-owner to update BaseURI."
//     );
//     assert((await hume721a.baseURI()) == "NEW_BASE_URI");
//   });

//   it.only("Should fail to airdrop by non recipient", async () => {
//     const pathAddresses = path.resolve(__dirname, `../config/addresses.json`);
//     const addresses = JSON.parse(fetchFile(pathAddresses));
//     console.log(`${addresses.length} addresses in json.`);

//     let ids: number[] = [];
//     for (let i = 1; i <= deployConfig.quantity; i++) ids.push(i);

//     console.log(addresses);

//     await assertError(
//       async () => await hume721a.connect(recipient).airdrop(addresses),
//       "TransferFromIncorrectOwner()",
//       "Allowed airdrop from non-owner."
//     );
//   });