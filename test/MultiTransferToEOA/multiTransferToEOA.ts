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

describe("multiTransferToEOA test", () => {
    let humeAngelbaby: HumeAngelbabyCommunityEP1;
    let config: ConstructorConfigStruct;
    let addresses: string[] = []
    let quantity: number

    beforeEach(async () => {
        config = {
            name: "ANGELBABY",
            symbol: "AGBB",
            tokenURI: "OLD_TOKEN_URI",
            quantity: 50,
            admin: admin.address,
            owner: owner.address,
        };

        createChildTx = await angelBabyFactory
            .connect(factoryOwner)
            .createChildTyped(config);

        const { sender, child } = await getEventArgs(
            createChildTx,
            "NewChild",
            angelBabyFactory
        );

        humeAngelbaby = (await ethers.getContractAt(
            (
                await artifacts.readArtifact("HumeAngelbabyCommunityEP1")
            ).abi,
            child
        )) as HumeAngelbabyCommunityEP1;

        quantity = parseInt(await (await humeAngelbaby.totalSupply())._hex);

        for (let i = 0; i <= quantity - 1; i++) {
            addresses[i] = ethers.Wallet.createRandom().address;
        }
    });

    it("Should transfer all tokens", async () => {

        const transferTo: TransferToStruct[] = [];

        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo);

        for (let i = 0; i < quantity; i++) {
            expect(await humeAngelbaby.ownerOf(transferTo[i].id)).to.equals(
                transferTo[i].to
            );
        }
    });

    it("Should not transfer tokens to another contract", async () => {

        // Adding contract address to list of recipients - using the factory for simplicity
        addresses.pop()
        addresses.push(angelBabyFactory.address)

        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo);

        // Contract should not have received a token
        expect(await humeAngelbaby.balanceOf(angelBabyFactory.address)).to.equals(0);

    });

    it("Should revert when attempting to airdrop token ids that don't exist", async () => {
        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        // Adding an id that is out of range
        transferTo[10].id = quantity * 2

        await expect(humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo)).to.revertedWith('OwnerQueryForNonexistentToken()');

    })

    it("Should revert when attempting to airdrop duplicate token ids", async () => {
        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        // Duplicating an id in the array of TransferTos
        transferTo[Math.floor(quantity / 2)].id = Math.floor(quantity / 3)

        await expect(humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo)).to.revertedWith('TransferFromIncorrectOwner()');

    })

    it("Should allow for duplicate addresses in the array of recipients", async () => {
        const duplicateAddress = addresses[27]
        addresses[30] = duplicateAddress

        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo);

        // Contract should not have received a token
        expect(await humeAngelbaby.balanceOf(duplicateAddress)).to.equals(2);
    })

    it("Should have no effect when passing an empty array of TransferTos", async () => {
        const transferTo: TransferToStruct[] = [];
        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo);

        expect(await humeAngelbaby.balanceOf(admin.address)).to.equals(quantity)
    })

    it("Should allow partial aidrops", async () => {
        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        // Airdrop to the first half of the list
        const firstHalf = transferTo.slice(0, Math.ceil(transferTo.length / 2))
        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(firstHalf);

        // Airdrop to the second half of the list
        const secondHalf = transferTo.slice(-Math.ceil(transferTo.length / 2))
        const transferTx2 = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(secondHalf);

        for (let i = 0; i < quantity; i++) {
            expect(await humeAngelbaby.ownerOf(transferTo[i].id)).to.equals(
                transferTo[i].to
            );
        }

    })

    it("Should revert when trying to airdrop tokens that have already been transferred", async () => {

        const transferTo: TransferToStruct[] = [];
        for (let i = 1; i <= quantity; i++) {
            transferTo.push({
                id: i,
                to: addresses[i - 1],
            });
        }

        // Airdrop to the first half of the list
        const firstHalf = transferTo.slice(0, Math.ceil(transferTo.length / 2))
        const transferTx = await humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(firstHalf);

        // Now attempt to airdrop again to the whole list
        await expect(humeAngelbaby
            .connect(admin)
            .multiTransferToEOA(transferTo)).to.revertedWith("TransferFromIncorrectOwner()");
    });

});
