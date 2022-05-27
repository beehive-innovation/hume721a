import hre, { artifacts, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  BaseURIChangedEvent,
  Hume721A,
  InitializeEvent,
  TransferEvent,
  DeployConfigStruct,
} from "../typechain/Hume721A";
import { Hume721AFactory } from "../typechain/Hume721AFactory";
import { ReserveTokenERC721 } from "../typechain/ReserveTokenERC721";
import { expectRevert } from "@openzeppelin/test-helpers";
import { assert, expect } from "chai";
import { fetchFile, getEventArgs, assertError } from "./utils";
import path from "path";
import { BigNumber } from "ethers";

export let hume721a: Hume721A
export let humeFactory: Hume721AFactory

export let erc721: ReserveTokenERC721;
export let owner: SignerWithAddress, recipient: SignerWithAddress;

export let deployConfig: DeployConfigStruct;

export let tx;
before(async () => {
  const signers = await ethers.getSigners();
  owner = signers[0];
  recipient = signers[1];

  const HumeFactory = await ethers.getContractFactory("Hume721AFactory");

  humeFactory = await HumeFactory.deploy() as Hume721AFactory;

  await humeFactory.deployed();

  deployConfig = {
    name: "HUME",
    symbol: "HM",
    quantity: 50,
    baseURI: "OLD_BASE_URI",
    admin: recipient.address
  }

  tx = await humeFactory.connect(owner).createChildTyped(deployConfig);

  const [humeAddress, sender] = await getEventArgs(tx, "NewChild", humeFactory, humeFactory.address);

  hume721a = await ethers.getContractAt((await (artifacts.readArtifact("Hume721A"))).abi, humeAddress, owner) as Hume721A;
})

describe("Hume721a test", () => {
  it("Should deploy Hume721Afactory",async () => {
    assert(await humeFactory.owner() == owner.address, "Wrong factory address.")

  });

  it("should construct correctly", async () => {
    // mints
    const balanceOwner = await hume721a.balanceOf(recipient.address);
    assert(balanceOwner.eq(deployConfig.quantity), "wrong quantity minted");
    assert((await hume721a.owner()) == owner.address, "wrong owner");

    const { from, to, tokenId } = (await getEventArgs(
      tx,
      "Transfer",
      hume721a
    )) as TransferEvent["args"];
    assert(from === ethers.constants.AddressZero, "wrong minter");
    assert(to === recipient.address, "wrong mintee");
    assert(tokenId.eq(1), "wrong start token id");

    // sets vars
    assert(
      (await hume721a.baseURI()) === deployConfig.baseURI,
      "did not set baseURI"
    );

    // initializes
    const { config, sender } = (await getEventArgs(
      tx,
      "Initialize",
      hume721a
    )) as InitializeEvent["args"];

    assert(config.name === deployConfig.name, "incorrect name");
    assert(config.symbol === deployConfig.symbol, "incorrect symbol");
    assert(config.quantity.eq(deployConfig.quantity), "incorrect quantity");
    assert(config.baseURI === deployConfig.baseURI, "incorrect baseURI");
    assert(config.recipient === deployConfig.recipient, "incorrect owner");
  });

  it("Should deploy Hume721a contract", async () => {
    assert(hume721a.address != ethers.constants.AddressZero);
    assert((await hume721a.totalSupply()).eq(50));
    await assertError(
      async () =>
        await hume721a.ownerOf(BigNumber.from(deployConfig.quantity).add(1)),
      "OwnerQueryForNonexistentToken()",
      "Allowed owner check for more IDs than minted."
    );
  });

  it("50 nfts whould be owned by owner", async () => {
    expect(await hume721a.balanceOf(recipient.address)).to.deep.equals(
      ethers.BigNumber.from(50)
    );
    expect(await hume721a.ownerOf(1)).to.equals(recipient.address);
    expect(await hume721a.ownerOf(11)).to.equals(recipient.address);
    expect(await hume721a.ownerOf(21)).to.equals(recipient.address);
    expect(await hume721a.ownerOf(31)).to.equals(recipient.address);
    expect(await hume721a.ownerOf(41)).to.equals(recipient.address);
    expect(await hume721a.ownerOf(50)).to.equals(recipient.address);
  });

  it("Should test baseURI change", async () => {
    expect(await hume721a.tokenURI(1)).to.equals("OLD_BASE_URI");
    expect(await hume721a.tokenURI(11)).to.equals("OLD_BASE_URI");
    expect(await hume721a.tokenURI(21)).to.equals("OLD_BASE_URI");
    expect(await hume721a.tokenURI(41)).to.equals("OLD_BASE_URI");

    const txBaseURI = await hume721a.setBaseURI("NEW_BASE_URI");
    const { baseURI: eventBaseURI_ } = (await getEventArgs(
      txBaseURI,
      "BaseURIChanged",
      hume721a
    )) as BaseURIChangedEvent["args"];

    assert(
      eventBaseURI_ === "NEW_BASE_URI",
      "wrong baseURI in BaseURIChanged event"
    );

    expect(await hume721a.tokenURI(1)).to.equals("NEW_BASE_URI");
    expect(await hume721a.tokenURI(11)).to.equals("NEW_BASE_URI");
    expect(await hume721a.tokenURI(21)).to.equals("NEW_BASE_URI");
    expect(await hume721a.tokenURI(41)).to.equals("NEW_BASE_URI");
  });

  it.only("Should transfer Nfts", async () => {
    const pathAddresses = path.resolve(__dirname, `../config/addresses.json`);
    const addresses = JSON.parse(fetchFile(pathAddresses));
    console.log(addresses, `${addresses.length} addresses in json.`);

    let ids: number[] = [];
    for (let i = 1; i <= deployConfig.quantity; i++) {
      ids.push(i);
    }

    let transfer = await hume721a.connect(recipient).airdrop(addresses);
    await transfer.wait();

    for (let i = 1; i <= deployConfig.quantity; i++) {
      expect(await hume721a.ownerOf(i)).to.equals(addresses[i - 1]);
    }
  });
});

describe("Negative testing", () => {
  it(`TokenId 0 and must not be owned`, async () => {
    await assertError(
      async () => await hume721a.ownerOf(0),
      "OwnerQueryForNonexistentToken()",
      "Allowed owner check for 0 ID."
    );
  });

  it("Should fail to update the BaseURI by non owner", async () => {
    await assertError(
      async () => await hume721a.connect(recipient).setBaseURI("Fail."),
      "Ownable: caller is not the owner",
      "Allowed non-owner to update BaseURI."
    );
    assert((await hume721a.baseURI()) == "NEW_BASE_URI");
  });

  it.only("Should fail to airdrop by non recipient", async () => {
    const pathAddresses = path.resolve(__dirname, `../config/addresses.json`);
    const addresses = JSON.parse(fetchFile(pathAddresses));
    console.log(`${addresses.length} addresses in json.`);

    let ids: number[] = [];
    for (let i = 1; i <= deployConfig.quantity; i++) ids.push(i);

    console.log(addresses);

    await assertError(
      async () => await hume721a.connect(recipient).airdrop(addresses),
      "TransferFromIncorrectOwner()",
      "Allowed airdrop from non-owner."
    );
  });
});
