import { artifacts, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1,
  TransferToStruct,
} from "../../typechain/HumeAngelbabyCommunityEP1";
import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
import { expect } from "chai";
import { getEventArgs } from "../../utils";

export let angelBaby: HumeAngelbabyCommunityEP1;
export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;

export let admin: SignerWithAddress,
  owner: SignerWithAddress,
  factoryOwner: SignerWithAddress;

export let ConstructorConfig: ConstructorConfigStruct;

export let deployTransaction;
export let createChildTx;

before(async () => {
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
});

describe("tokenURI tests", () => {
  let humeAngelBaby: HumeAngelbabyCommunityEP1;
  let config: ConstructorConfigStruct;
  const addresses: string[] = [];
  let quantity: number;

  beforeEach(async () => {
    config = {
      name: "ANGELBABY",
      symbol: "AGBB",
      baseURI: "OLD_BASE_URI",
      quantity: 50,
      admin: admin.address,
      owner: owner.address,
    };

    createChildTx = await angelBabyFactory
      .connect(factoryOwner)
      .createChildTyped(config);

    const { child } = await getEventArgs(
      createChildTx,
      "NewChild",
      angelBabyFactory
    );

    humeAngelBaby = (await ethers.getContractAt(
      (
        await artifacts.readArtifact("HumeAngelbabyCommunityEP1")
      ).abi,
      child
    )) as HumeAngelbabyCommunityEP1;

    quantity = parseInt(await (await humeAngelBaby.totalSupply())._hex);

    for (let i = 0; i <= quantity - 1; i++) {
      addresses[i] = ethers.Wallet.createRandom().address;
    }
  });

  it("Should return the correct tokenURI after intialization", async () => {
    const tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(config.baseURI);
  });

  it("Should return the correct tokenURI after being updated", async () => {
    const newTokenURI = "NEW_TOKEN_URI";
    await humeAngelBaby.connect(admin).adminSetTokenURI(newTokenURI);
    const tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(newTokenURI);
  });

  it("Should revert when calling tokenURI() for a non-existent id", async () => {
    await expect(
      humeAngelBaby.connect(admin).tokenURI(quantity + 1)
    ).revertedWith("URIQueryForNonexistentToken()");
  });

  it("Shouldn't enforce any format when setting tokenURI", async () => {
    let tokenUri: string, newTokenURI: string;

    newTokenURI = "http://google.com";
    await humeAngelBaby.connect(admin).adminSetTokenURI(newTokenURI);
    tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(newTokenURI);

    newTokenURI = "ipfs://QmPvjoUdAJVZMVACLqj77wsrQyaJVu9VpKdDRHvFK5cLzR";
    await humeAngelBaby.connect(admin).adminSetTokenURI(newTokenURI);
    tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(newTokenURI);

    newTokenURI = "Some other string";
    await humeAngelBaby.connect(admin).adminSetTokenURI(newTokenURI);
    tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(newTokenURI);
  });
});
