import { artifacts, ethers } from "hardhat";
import { HumeAngelbabyCommunityEP1 } from "../../typechain/HumeAngelbabyCommunityEP1";
import { expect } from "chai";

export const checkChildIntegrity = async (angelBabyFactory, child, config) => {
  console.log(config)
  const angelBaby = (await ethers.getContractAt(
    (
      await artifacts.readArtifact("HumeAngelbabyCommunityEP1")
    ).abi,
    child
  )) as HumeAngelbabyCommunityEP1;

  expect(await angelBabyFactory.isChild(child)).to.be.true;
  expect(angelBaby.address).to.equals(child);
  expect(await angelBaby.owner()).to.equals(
    config.owner,
    `Owner is ${angelBaby.owner()} not ${config.owner}`
  );
  expect(await angelBaby.admin()).to.equals(
    config.admin,
    `admin is ${angelBaby.admin()} not ${config.admin}`
  );
  expect(await angelBaby.name()).to.equals(
    config.name,
    `name is ${angelBaby.name()} not ${config.name}`
  );
  expect(await angelBaby.symbol()).to.equals(
    config.symbol,
    `symbol is ${angelBaby.symbol()} not ${config.symbol}`
  );
  expect(await angelBaby.tokenURI(1)).to.equals(
    `${config.baseURI}1`,
    `tokenURI is ${angelBaby.tokenURI(1)} not ${config.baseURI}1`
  );
  expect(await angelBaby.totalSupply()).to.equals(
    config.quantity,
    `totalSupply is ${angelBaby.totalSupply()} not ${config.quantity}`
  );

  expect(await angelBaby.ownerOf(1)).to.equals(config.admin);
  expect(await angelBaby.ownerOf(config.quantity)).to.equals(config.admin);
};
