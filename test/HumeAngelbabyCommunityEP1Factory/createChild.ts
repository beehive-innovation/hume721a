import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { artifacts, ethers } from "hardhat";
import {
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1,
} from "../../typechain/HumeAngelbabyCommunityEP1";
import { Contract } from "ethers";
import { getEventArgs } from "../../utils";
import { checkChildIntegrity } from "./childIntegrity";

import { expect } from "chai";
export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;

let admin: SignerWithAddress;
let owner: SignerWithAddress;
let factoryOwner: SignerWithAddress;
let newFactoryOwner: SignerWithAddress;

let config: ConstructorConfigStruct;
let reference: Contract;

beforeEach(async () => {
  const signers = await ethers.getSigners();
  admin = signers[0];
  owner = signers[1];
  factoryOwner = signers[3];
  newFactoryOwner = signers[4];

  const AngelbabyFactory = await ethers.getContractFactory(
    "HumeAngelbabyCommunityEP1Factory"
  );

  angelBabyFactory = (await AngelbabyFactory.connect(
    factoryOwner
  ).deploy()) as HumeAngelbabyCommunityEP1Factory;

  expect(angelBabyFactory.address).to.be.not.null;
  config = {
    name: "ANGELBABY",
    symbol: "AGBB",
    tokenURI: "OLD_TOKEN_URI",
    quantity: 100,
    admin: admin.address,
    owner: owner.address,
  };

  const referenceAbi = (
    await artifacts.readArtifact("HumeAngelbabyCommunityEP1Factory")
  ).abi;
  reference = new Contract(
    ethers.constants.AddressZero,
    referenceAbi,
    owner
  );
});

it("Owner should be able to create child", async () => {
  const config: ConstructorConfigStruct = {
    name: "ANGELBABY",
    symbol: "AGBB",
    tokenURI: "OLD_TOKEN_URI",
    quantity: 100,
    admin: admin.address,
    owner: owner.address,
  };

  const createChildTx = await angelBabyFactory
    .connect(factoryOwner)
    .createChild(ethers.utils.AbiCoder.encode([config]));

  const { sender, child } = await getEventArgs(
    createChildTx,
    "NewChild",
    angelBabyFactory
  );
  expect(sender).to.equals(factoryOwner.address);

  await checkChildIntegrity(angelBabyFactory, child, config);
});

it("Should fail to create a child using createChild() by non owner address", async () => {
  await expect(
    angelBabyFactory
      .connect(owner)
      .createChild(
        reference.interface.encodeFunctionData("createChildTyped", [config])
      )
  ).to.revertedWith("Ownable: caller is not the owner");
});
