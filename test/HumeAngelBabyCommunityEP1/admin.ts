import { ethers, artifacts } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ConstructorConfigStruct,
  HumeAngelbabyCommunityEP1,
} from "../../typechain/HumeAngelbabyCommunityEP1";
import { HumeAngelbabyCommunityEP1Factory } from "../../typechain/HumeAngelbabyCommunityEP1Factory";
import { expect } from "chai";
import { getEventArgs } from "../../utils";

export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;

export let admin: SignerWithAddress,
  new_Admin: SignerWithAddress,
  owner: SignerWithAddress,
  new_Owner: SignerWithAddress,
  recipient: SignerWithAddress,
  factoryOwner: SignerWithAddress,
  newFactoryOwner: SignerWithAddress;

export let ConstructorConfig: ConstructorConfigStruct;

export let deployTransaction;
export let createChildTx;

before(async () => {
  const signers = await ethers.getSigners();
  admin = signers[0];
  owner = signers[1];
  recipient = signers[2];
  factoryOwner = signers[3];
  new_Owner = signers[5];
  new_Admin = signers[6];

  const AngelbabyFactory = await ethers.getContractFactory(
    "HumeAngelbabyCommunityEP1Factory"
  );

  angelBabyFactory = (await AngelbabyFactory.connect(
    factoryOwner
  ).deploy()) as HumeAngelbabyCommunityEP1Factory;
});

describe("HumeAngelbabyCommunityEP1 Admin test", () => {
  let humeAngelBaby: HumeAngelbabyCommunityEP1;
  let config: ConstructorConfigStruct;

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
  });

  it("Admin should be able to change tokenUri", async () => {
    const newBaseURI = "NEW_TOKEN_URI";
    const baseURITx = await humeAngelBaby
      .connect(admin)
      .adminSetBaseURI(newBaseURI);

    const { sender, baseURI } = await getEventArgs(
      baseURITx,
      "BaseURI",
      humeAngelBaby
    );

    expect(sender).to.be.equals(admin.address);
    expect(baseURI).to.be.equals(newBaseURI);
    expect(await humeAngelBaby.tokenURI(1)).to.equals(
      `${newBaseURI}1`,
      `tokenURI is ${humeAngelBaby.tokenURI(2)} not ${newBaseURI}1`
    );
  });

  it("Owner should not be able to change tokenUri", async () => {
    await expect(
      humeAngelBaby.connect(owner).adminSetBaseURI("NEW_TOKEN_URI")
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("A signer that is neither Owner or Admin should not be able to change tokenUri", async () => {
    await expect(
      humeAngelBaby.connect(recipient).adminSetBaseURI("NEW_TOKEN_URI")
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("Admin should be able to change owner", async () => {
    const ownerTx = await humeAngelBaby
      .connect(admin)
      .adminSetOwner(new_Owner.address);

    const { previousOwner, newOwner } = await getEventArgs(
      ownerTx,
      "OwnershipTransferred",
      humeAngelBaby
    );

    expect(await humeAngelBaby.owner()).to.be.equals(newOwner);
    expect(previousOwner).to.be.equals(owner.address);
    expect(newOwner).to.be.equals(new_Owner.address);
  });

  it("Owner should not be able to change Owner via adminSetOwner", async () => {
    await expect(
      humeAngelBaby.connect(owner).adminSetOwner(new_Owner.address)
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("A signer that is neither Owner or Admin should not be able to change Owner via adminSetOwner", async () => {
    await expect(
      humeAngelBaby.connect(recipient).adminSetOwner(new_Owner.address)
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("Admin should be able to transfer adminship", async () => {
    const adminTx = await humeAngelBaby.transferAdmin(new_Admin.address);

    const { previousAdmin, newAdmin } = await getEventArgs(
      adminTx,
      "AdminTransferred",
      humeAngelBaby
    );

    expect(previousAdmin).to.be.equals(admin.address);
    expect(newAdmin).to.be.equals(new_Admin.address);
    expect(await humeAngelBaby.admin()).to.be.equals(new_Admin.address);
  });

  it("Owner should not be able to transfer adminship", async () => {
    await expect(
      humeAngelBaby.connect(owner).transferAdmin(new_Admin.address)
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("Admin should be able set a new Owner when ownership has been renounced by the previous Owner", async () => {
    await humeAngelBaby.connect(owner).renounceOwnership();

    expect(await humeAngelBaby.owner()).to.be.equals(
      ethers.constants.AddressZero
    );

    await humeAngelBaby.connect(admin).adminSetOwner(new_Owner.address);

    expect(await humeAngelBaby.owner()).to.be.equals(new_Owner.address);
  });
});
