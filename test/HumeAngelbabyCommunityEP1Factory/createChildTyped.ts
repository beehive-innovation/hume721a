import {
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1,
} from "../../typechain/HumeAngelbabyCommunityEP1";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
import { getEventArgs } from "../../utils";
import { ethers } from "hardhat";
import { expect } from "chai";
import { checkChildIntegrity } from "./childIntegrity";

export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;

let admin: SignerWithAddress;
let owner: SignerWithAddress;
let factoryOwner: SignerWithAddress;

export let angelBaby: HumeAngelbabyCommunityEP1;

beforeEach(async () => {
  const signers = await ethers.getSigners();
  admin = signers[0];
  owner = signers[1];
  factoryOwner = signers[3];

  const AngelbabyFactory = await ethers.getContractFactory(
    "HumeAngelbabyCommunityEP1Factory"
  );

  angelBabyFactory = (await AngelbabyFactory.connect(
    factoryOwner
  ).deploy()) as HumeAngelbabyCommunityEP1Factory;

  expect(angelBabyFactory.address).to.be.not.null;
});

it("Owner should be able to create child typed", async () => {
  const config: ConstructorConfigStruct = {
    name: "ANGELBABY",
    symbol: "AGBB",
    baseURI: "OLD_BASE_URI",
    quantity: 100,
    admin: admin.address,
    owner: owner.address,
  };

  const createChildTx = await angelBabyFactory
    .connect(factoryOwner)
    .createChildTyped(config);

  const { sender, child } = await getEventArgs(
    createChildTx,
    "NewChild",
    angelBabyFactory
  );
  expect(sender).to.equals(angelBabyFactory.address);

  await checkChildIntegrity(angelBabyFactory, child, config);
});

it("Non owner should NOT be able to create child typed", async () => {
  const config: ConstructorConfigStruct = {
    name: "ANGELBABY",
    symbol: "AGBB",
    baseURI: "OLD_BASE_URI",
    quantity: 100,
    admin: admin.address,
    owner: owner.address,
  };

  await expect(
    angelBabyFactory.connect(owner).createChildTyped(config)
  ).to.revertedWith("Ownable: caller is not the owner");
});
