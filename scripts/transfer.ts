import hre, { artifacts, ethers } from "hardhat";
import path from "path";
import { Hume721A } from "../typechain/Hume721A"
import { fetchFile } from "../test/utils";
import assert from "assert";

async function main() {   

    const signers = await ethers.getSigners();
  
    const pathExampleConfig = path.resolve(__dirname, `../config/${hre.network.name}.json`);
    const config = JSON.parse(fetchFile(pathExampleConfig));

    const pathAddresses = path.resolve(__dirname, `../config/addresses.json`);
    const addresses = JSON.parse(fetchFile(pathAddresses));
    console.log(`${addresses.length} addresses in json.`)
    const hume721A: Hume721A = await ethers.getContractAt((await artifacts.readArtifact("Hume721A")).abi, config.hume721A) as Hume721A;
   
    assert(await hume721A.ownerOf(1) == signers[0].address, "before Wrong Owner");
    assert(await hume721A.ownerOf(25) == signers[0].address, "before Wrong Owner");
    assert(await hume721A.ownerOf(50) == signers[0].address, "before Wrong Owner");

    for(let i=0; i<addresses.length; i++){
      let tx = await hume721A.transferFrom(signers[0].address, addresses[i], i+1);
      // await tx.wait();
      // assert(await hume721A.ownerOf(i+1) == addresses[i], `Wrong Owner ${i+1}`);
    }
    
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });