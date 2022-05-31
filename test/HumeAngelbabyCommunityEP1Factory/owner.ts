import { HumeAngelbabyCommunityEP1 } from "../../typechain/HumeAngelbabyCommunityEP1";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
import { getEventArgs } from "../../utils";

let factoryOwner: SignerWithAddress;
let newFactoryOwner: SignerWithAddress;

export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;
export let angelBaby: HumeAngelbabyCommunityEP1;

beforeEach(async () => {
  const signers = await ethers.getSigners();
  factoryOwner = signers[3];
  newFactoryOwner = signers[4];

  const AngelbabyFactory = await ethers.getContractFactory(
    "HumeAngelbabyCommunityEP1Factory"
  );

  angelBabyFactory = (await AngelbabyFactory.connect(
    factoryOwner
  ).deploy()) as HumeAngelbabyCommunityEP1Factory;

  expect(angelBabyFactory.address).to.be.not.null;
});

it("HumeAngelbabyCommunityEP1Factory should be owned by Owner", async () => {
  expect(await angelBabyFactory.owner()).to.equals(factoryOwner.address);
});

it("Should transfer the ownership to another address.", async () => {
  const ownershipTransferTx = await angelBabyFactory
    .connect(factoryOwner)
    .transferOwnership(newFactoryOwner.address);

  const { previousOwner, newOwner } = await getEventArgs(
    ownershipTransferTx,
    "OwnershipTransferred",
    angelBabyFactory
  );

  expect(await angelBabyFactory.owner()).to.equals(newFactoryOwner.address);
  expect(previousOwner).to.equals(factoryOwner.address);
  expect(newOwner).to.equals(newFactoryOwner.address);
});

it("Should fail to transfer ownership by non-owner address", async () => {
  await expect(
    angelBabyFactory
      .connect(newFactoryOwner)
      .transferOwnership(factoryOwner.address)
  ).to.revertedWith("Ownable: caller is not the owner");
});
