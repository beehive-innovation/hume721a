import {
    ConstructorConfigStruct,
    HumeAngelbabyCommunityEP1,
    TransferToStruct,
  } from "../../typechain/HumeAngelbabyCommunityEP1";
  import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
  import { artifacts, ethers } from "hardhat";
  import { expect } from "chai";
  import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
  import { getEventArgs } from "../../utils";

let admin: SignerWithAddress;
let owner: SignerWithAddress;
let factoryOwner: SignerWithAddress;
let newFactoryOwner: SignerWithAddress;

export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;
export let angelBaby: HumeAngelbabyCommunityEP1;

before(async () => {
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
})

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
      .createChildTyped(config);

    const { sender, child } = await getEventArgs(
      createChildTx,
      "NewChild",
      angelBabyFactory
    );

    // angelBaby = (await ethers.getContractAt(
    //   (
    //     await artifacts.readArtifact("HumeAngelbabyCommunityEP1")
    //   ).abi,
    //   child
    // )) as HumeAngelbabyCommunityEP1;

    // expect(await angelBabyFactory.isChild(child)).to.be.true;
    // expect(sender).to.equals(angelBabyFactory.address);
    // expect(angelBaby.address).to.equals(child);
    // expect(await angelBaby.owner()).to.equals(
    //   owner.address,
    //   `Owner is ${angelBaby.owner()} not ${owner.address}`
    // );
    // expect(await angelBaby.admin()).to.equals(
    //   admin.address,
    //   `admin is ${angelBaby.admin()} not ${admin.address}`
    // );
    // expect(await angelBaby.name()).to.equals(
    //   config.name,
    //   `name is ${angelBaby.name()} not ${config.name}`
    // );
    // expect(await angelBaby.symbol()).to.equals(
    //   config.symbol,
    //   `symbol is ${angelBaby.symbol()} not ${config.symbol}`
    // );
    // expect(await angelBaby.tokenURI(1)).to.equals(
    //   config.tokenURI,
    //   `tokenURI is ${angelBaby.tokenURI(2)} not ${config.tokenURI}`
    // );
    // expect(await angelBaby.totalSupply()).to.equals(
    //   config.quantity,
    //   `totalSupply is ${angelBaby.totalSupply()} not ${config.quantity}`
    // );

    // expect(await angelBaby.ownerOf(1)).to.equals(admin.address);
    // expect(await angelBaby.ownerOf(config.quantity)).to.equals(admin.address);
  });