import hre, { ethers } from "hardhat";
import path from "path";
import { fetchFile, writeFile } from "../utils";
import { HumeAngelbabyCommunityEP1 } from "../typechain/HumeAngelbabyCommunityEP1";
import { HumeAngelbabyCommunityEP1Factory } from "../typechain/HumeAngelbabyCommunityEP1Factory";

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

export let angelBaby: HumeAngelbabyCommunityEP1
export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory

async function main() {
  const blockNumber = (await ethers.provider.getBlock("latest")).number;

  console.log("Deploying smartcontract");
  const AngelbabbyFactory = await ethers.getContractFactory("HumeAngelbabyCommunityEP1Factory");

  angelBabyFactory = await AngelbabbyFactory.deploy() as HumeAngelbabyCommunityEP1Factory;
  console.log("contract deployed : ", angelBabyFactory.address);

  const pathExampleConfig = path.resolve(
    __dirname,
    `../config/${hre.network.name}.json`
  );
  const config = JSON.parse(fetchFile(pathExampleConfig));

  config.network = hre.network.name;

  config.angelBabyFactory = angelBabyFactory.address;
  config.angelBabyFactoryBlock = blockNumber;

  const pathConfigLocal = path.resolve(
    __dirname,
    `../config/${hre.network.name}.json`
  );
  writeFile(pathConfigLocal, JSON.stringify(config, null, 2));

  await sleep(30);

  console.log("Verifying smartcontract");
  await hre.run("verify:verify", {
    address: angelBabyFactory.address,
    contract: "contracts/HumeAngelbabyCommunityEP1Factory.sol:HumeAngelbabyCommunityEP1Factory",
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
