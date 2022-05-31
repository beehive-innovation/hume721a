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
let encodedConfig;

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
  encodedConfig = ethers.utils.defaultAbiCoder.encode(
    [
      "tuple(string name, string symbol, string tokenURI, uint256 quantity, address admin, address owner)",
    ],
    [config]
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
    .createChild(encodedConfig);

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
    angelBabyFactory.connect(owner).createChild(encodedConfig)
  ).to.revertedWith("Ownable: caller is not the owner");
});
