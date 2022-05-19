import hre, { ethers } from "hardhat";
import path from "path";
import { fetchFile, writeFile} from "../test/utils";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay * 1000));
let name = "HUME";
let symbol = "HM";
let quantity = 50;
let baseURI = "https://api.fluf.world/api/token/7726";

async function main() {   
  
    const blockNumber = (await ethers.provider.getBlock("latest")).number;

    console.log("Deploying smartcontract")
    const Hume721A = await ethers.getContractFactory("Hume721A");
    const hume721A = await Hume721A.deploy(name, symbol, baseURI, quantity);
    await hume721A.deployed()
    console.log("contract deployed : ", hume721A.address)

    const pathExampleConfig = path.resolve(__dirname, `../config/${hre.network.name}.json`);
    const config = JSON.parse(fetchFile(pathExampleConfig));

    config.network = "mumbai";

    config.hume721A = hume721A.address;
    config.hume721ABlock = blockNumber;

    const pathConfigLocal = path.resolve(__dirname, `../config/${hre.network.name}.json`);
    writeFile(pathConfigLocal, JSON.stringify(config, null, 2));


    await sleep(30);

    console.log("Verifying smartcontract")
    await hre.run("verify:verify", {
      address: hume721A.address,
      contract: "contracts/Hume721A.sol:Hume721A",
      constructorArguments: [name, symbol, baseURI, quantity],
    });
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });