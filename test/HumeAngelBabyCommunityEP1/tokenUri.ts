import { artifacts, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1,
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
    expect(tokenUri).to.equal(`${config.baseURI}1`);
  });

  it("Should return the correct tokenURI pattern for each id", async () => {
    for (let i = 1; i < quantity; i++) {
      const tokenUri = await humeAngelBaby.connect(admin).tokenURI(i);
      expect(tokenUri).to.equal(`${config.baseURI}${i}`);
    }
  });

  it("Should return the correct tokenURI after being updated", async () => {
    const newBaseURI = "NEW_TOKEN_URI";
    await humeAngelBaby.connect(admin).adminSetBaseURI(newBaseURI);
    const tokenUri = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenUri).to.equal(`${newBaseURI}1`);
  });

  it("Should revert when calling tokenURI() for a non-existent id", async () => {
    await expect(
      humeAngelBaby.connect(admin).tokenURI(quantity + 1)
    ).revertedWith("URIQueryForNonexistentToken()");
  });

  it("Shouldn't enforce any format when setting baseURI", async () => {
    let tokenURI: string, newBaseURI: string;

    newBaseURI = "http://google.com";
    await humeAngelBaby.connect(admin).adminSetBaseURI(newBaseURI);
    tokenURI = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenURI).to.equal(`${newBaseURI}1`);

    newBaseURI = "ipfs://QmPvjoUdAJVZMVACLqj77wsrQyaJVu9VpKdDRHvFK5cLzR";
    await humeAngelBaby.connect(admin).adminSetBaseURI(newBaseURI);
    tokenURI = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenURI).to.equal(`${newBaseURI}1`);

    newBaseURI = "Some other string";
    await humeAngelBaby.connect(admin).adminSetBaseURI(newBaseURI);
    tokenURI = await humeAngelBaby.connect(admin).tokenURI(1);
    expect(tokenURI).to.equal(`${newBaseURI}1`);
  });
});
