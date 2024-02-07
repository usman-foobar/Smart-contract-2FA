const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blume Liquid Staking", function () {
  async function deployContract() {
    const [deployer, user1, user2, user3] = await ethers.getSigners();

    const TWO_FA_CONTRACT = await ethers.getContractFactory("TwoFaContract");
    const TwoFaContract = await TWO_FA_CONTRACT.deploy(30);

    return {
      TwoFaContract,
      deployer,
      user1,
      user2,
      user3,
    };
  }

  describe("2 Factor Authentication", function () {
    it("Shouldn't generate OTP if not registered", async function () {
      const { TwoFaContract, user1 } = await loadFixture(deployContract);

      await expect(TwoFaContract.connect(user1).generateOtp("username1")).to.be
        .rejected;
    });
    it("Should register User", async function () {
      const { TwoFaContract, user1 } = await loadFixture(deployContract);
      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username1",
          123,
          user1.address
        )
      ).to.be.fulfilled;
    });

    it("Shouldn't register already registered username or private key", async function () {
      const { TwoFaContract, user1, user2 } = await loadFixture(deployContract);
      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username1",
          123,
          user1.address
        )
      ).to.be.fulfilled;

      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username1",
          123,
          user2.address
        )
      ).to.be.rejected;

      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username2",
          123,
          user1.address
        )
      ).to.be.rejected;
    });

    it("Should not generate OTP if username is not registered or transaction is not signed by public key holder", async function () {
      const { TwoFaContract, user1, user2 } = await loadFixture(deployContract);
      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username1",
          123,
          user1.address
        )
      ).to.be.fulfilled;

      await expect(TwoFaContract.connect(user1).generateOtp("username0")).to.be
        .rejected;

      await expect(TwoFaContract.connect(user2).generateOtp("username1")).to.be
        .rejected;
    });

    it("Should be able to generate OTP after registration", async function () {
      const { TwoFaContract, user1 } = await loadFixture(deployContract);
      await expect(
        TwoFaContract.connect(user1).userRegistration(
          "username1",
          123,
          user1.address
        )
      ).to.be.fulfilled;

      let response = await TwoFaContract.connect(user1).generateOtp(
        "username1"
      );

      console.log(response.decodedOutput);
    });
  });
});
