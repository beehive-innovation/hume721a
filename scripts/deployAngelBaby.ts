import hre, { artifacts, ethers } from "hardhat";
import path from "path";
import { fetchFile, getEventArgs } from "../utils";
import { HumeAngelbabyCommunityEP1 } from "../typechain/HumeAngelbabyCommunityEP1";
import { HumeAngelbabyCommunityEP1Factory } from "../typechain/HumeAngelbabyCommunityEP1Factory";

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

export let angelBaby: HumeAngelbabyCommunityEP1;
export let angelBabyFactory: HumeAngelbabyCommunityEP1Factory;

async function main() {
  const pathExampleConfig = path.resolve(
    __dirname,
    `../config/${hre.network.name}.json`
  );
  const deployConfig = JSON.parse(fetchFile(pathExampleConfig));

  angelBabyFactory = (await ethers.getContractAt(
    (
      await artifacts.readArtifact("HumeAngelbabyCommunityEP1Factory")
    ).abi,
    deployConfig.angelBabyFactory
  )) as HumeAngelbabyCommunityEP1Factory;

  const config = {
    name: "ANGELBABY",
    symbol: "AGBB",
    tokenURI: "OLD_TOKEN_URI",
    quantity: 50,
    admin: "0xB77d30571fc6C253e645584D4deEF40c139A7900",
    owner: "0x36c0903Ad6D564F335333344Fab68ebCf736F629",
  };

  const trx = await angelBabyFactory.createChildTyped(config);

  await trx.wait();

  const { child } = await getEventArgs(trx, "NewChild", angelBabyFactory);

  console.log(`Angelbaby Contract deployed at : ${child}`);

  await sleep(30);

  console.log("Verifying smartcontract");
  await hre.run("verify:verify", {
    address: child,
    contract:
      "contracts/HumeAngelbabyCommunityEP1.sol:HumeAngelbabyCommunityEP1",
    constructorArguments: [config],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
