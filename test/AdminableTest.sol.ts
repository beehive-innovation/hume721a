import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AdminableTest } from "../typechain/AdminableTest";
import { expect } from "chai";
import { getEventArgs } from "../utils";

export let adminableContract: AdminableTest;
export let adminableContract2: AdminableTest;

export let admin: SignerWithAddress, new_Admin: SignerWithAddress;

before(async () => {
  const signers = await ethers.getSigners();
  admin = signers[0];
  new_Admin = signers[1];

  // Deploying the Adminable contract
  const AdminableContract = await ethers.getContractFactory("AdminableTest");
  adminableContract = (await AdminableContract.connect(admin).deploy(
    admin.address
  )) as AdminableTest;

  // Deploying the Adminable contract
  const AdminableContract2 = await ethers.getContractFactory("AdminableTest");
  adminableContract2 = (await AdminableContract2.connect(admin).deploy(
    admin.address
  )) as AdminableTest;
});

describe("Adminable Functionality Test", () => {
  it("Should deploy the AdminableTest contract", async () => {
    expect(adminableContract.address).to.be.not.null;
    expect(adminableContract2.address).to.be.not.null;
  });

  it("Should be owned by the Admin", async () => {
    expect(await adminableContract.admin()).to.be.equals(admin.address);
  });

  // admin --> new_Admin
  it("Should emit AdminTransferred event", async () => {
    expect(await adminableContract.transferAdmin(new_Admin.address)).to.emit(
      adminableContract,
      "AdminTransferred"
    );
  });

  // new_Admin --> admin
  it("Should transfer admin", async () => {
    const adminTransaction = await adminableContract
      .connect(new_Admin)
      .transferAdmin(admin.address);

    const { previousAdmin, newAdmin } = await getEventArgs(
      adminTransaction,
      "AdminTransferred",
      adminableContract
    );

    expect(newAdmin).to.be.equals(admin.address);
    expect(previousAdmin).to.be.equals(new_Admin.address);
  });

  it("Non Admin user should not be able to transfer admin", async () => {
    await expect(
      adminableContract.connect(new_Admin).transferAdmin(admin.address)
    ).to.revertedWith("Adminable: caller is not the admin");
  });

  it("Should not be able to transfer adminShip to zero-address", async () => {
    await expect(
      adminableContract.transferAdmin(ethers.constants.AddressZero)
    ).to.revertedWith("Adminable: new admin is the zero address");
  });

  it("Should be able to transfer adminShip to a Contract Address", async () => {
    const adminTransaction = await adminableContract.transferAdmin(
      adminableContract2.address
    );

    const { previousAdmin, newAdmin } = await getEventArgs(
      adminTransaction,
      "AdminTransferred",
      adminableContract
    );

    expect(newAdmin).to.be.equals(adminableContract2.address);
    expect(previousAdmin).to.be.equals(admin.address);
  });
});
