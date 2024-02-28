import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deployment", async () => {
  async function deployEventContract() {

    // Contracts are deployed using the first signer/account by default
    const [owner, anotherUser, user2] = await ethers.getSigners();



    const MultiSig = await ethers.getContractFactory("MultiSig");
    const multiSig = await MultiSig.deploy([anotherUser.address, owner.address], 2);

    return { multiSig, owner, anotherUser, user2 };
  }
  describe("constructor", async () => {
    it("Should be the owner of contract", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      expect(await multiSig.owner()).to.equal(owner.address);
    })
    it("checking for number of signers", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);
      const signers = await multiSig.getSigners();

      expect(signers).lengthOf(2);
      expect((signers as any)[0]).to.equal(anotherUser.address)
      expect((signers as any)[1]).to.equal(owner.address)
    })
    it("Should set quorum", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      expect(await multiSig.quorum()).to.equal(2);
    })
  })

  describe("initial transaction", async () => {
    it("should not be address zero", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      expect(owner.address).not.equal(ethers.ZeroAddress);
    })

    it("should revert if amount is zero", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);
      const amount = 0;

      await expect(multiSig.initiateTransaction(amount, owner.address)).to.revertedWith("no zero value allowed")
    })

    it("should be a valid signer", async () => {
      const { owner, multiSig, anotherUser, user2 } = await loadFixture(deployEventContract);
      const amount = 1;

      await expect(multiSig.connect(user2).initiateTransaction(amount, user2.address)).to.revertedWith("not valid signer")
    })

    it("should create new transactions", async () => {
      const { owner, multiSig, anotherUser, user2 } = await loadFixture(deployEventContract);
      const amount = 1;

      await multiSig.initiateTransaction(amount, anotherUser.address);

      const txcount = await multiSig.txCount();

      const tx = await multiSig.transactions(txcount);

      expect(tx.amount).to.equal(amount);


    })

    it("should check transaction creator and alltransactions", async () => {
      const { owner, multiSig, anotherUser, user2 } = await loadFixture(deployEventContract);

      const amount = 1;
      const receiver = user2.address;
      const txcreator = owner.address;


      const initialTx = await multiSig.initiateTransaction(amount, receiver);
      await initialTx.wait();

      expect(owner).to.equal(txcreator);
      expect((await multiSig.getAllTransactions()).length).to.equal(1);

    })

    it("checking wether a signer has signed", async () => {
      const { owner, multiSig, anotherUser, user2 } = await loadFixture(deployEventContract);
      const amount = 1;

      await multiSig.initiateTransaction(amount, anotherUser.address);

      const txcount = await multiSig.txCount();

      const tx = await multiSig.transactions(txcount);
      expect(tx.amount).to.equal(amount);
      expect(await multiSig.hasSigned(1, owner.address)).to.equal(true);


    })

  })

  describe("The approve function", async () => {
    it("Should revert if the an incorrect id is used", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      const amount = 1;

      await multiSig.initiateTransaction(amount, anotherUser.address);

      const txcount = await multiSig.txCount();

      const tx = await multiSig.transactions(txcount);

      expect(tx.amount).to.equal(amount);

      await expect(multiSig.approveTransaction(2)).to.be.revertedWith("invalid transaction id");

    })

    it("Should revert if the an incorrect id is used", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      expect(owner.address).not.equal(ethers.ZeroAddress);

    })

    it("Should not be allowed to sign twice", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      const amount = 10;

      await multiSig.initiateTransaction(amount, owner.address);

      const txcount = await multiSig.txCount();

      const tx = await multiSig.transactions(txcount);

      expect(tx.amount).to.equal(amount);


      expect(await multiSig.hasSigned(1, owner.address)).to.equal(true);

      await expect(multiSig.approveTransaction(1)).to.be.revertedWith("can't sign twice")

    })

    it("Should not be allowed to sign twice connecting another user in the quorom", async () => {
      const { owner, multiSig, anotherUser } = await loadFixture(deployEventContract);

      const amount = 10;

      await multiSig.connect(anotherUser).initiateTransaction(amount, anotherUser.address);

      const txcount = await multiSig.txCount();

      const tx = await multiSig.transactions(txcount);

      expect(tx.amount).to.equal(amount);


      expect(await multiSig.hasSigned(1, anotherUser.address)).to.equal(true);

      await expect(multiSig.connect(anotherUser).approveTransaction(1)).to.be.revertedWith("can't sign twice")

    })

    it("Should be able to transfer ownership", async () => {
      const { multiSig, user2 } = await loadFixture(deployEventContract);
      await multiSig.transferOwnership(user2.address);
      await multiSig.connect(user2).claimOwnership();
      expect(await multiSig.owner()).to.equal(user2.address);
    })
  })

})