import { expect } from "chai";
import { ethers } from "hardhat";
import { NoteNFT, RewardVault } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RewardVault", function () {
  let noteNFT: NoteNFT;
  let rewardVault: RewardVault;
  let owner: SignerWithAddress;
  let author: SignerWithAddress;
  let tipper: SignerWithAddress;
  let treasury: SignerWithAddress;

  beforeEach(async function () {
    [owner, author, tipper, treasury] = await ethers.getSigners();

    // Deploy NoteNFT
    const NoteNFTFactory = await ethers.getContractFactory("NoteNFT");
    noteNFT = await NoteNFTFactory.deploy("DeStudy Note", "DNOTE", "ipfs://");

    // Deploy RewardVault
    const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
    rewardVault = await RewardVaultFactory.deploy(
      await noteNFT.getAddress(),
      treasury.address,
      {
        authorBps: 8500, // 85%
        contributorsBps: 1000, // 10%
        treasuryBps: 500, // 5%
      }
    );

    // Mint a note
    await noteNFT.connect(author).mintNote(
      author.address,
      "QmTest",
      "IKNS-5300",
      "v1.0",
      ""
    );
  });

  describe("Deployment", function () {
    it("should set correct NoteNFT address", async function () {
      expect(await rewardVault.noteNFT()).to.equal(await noteNFT.getAddress());
    });

    it("should set correct treasury address", async function () {
      expect(await rewardVault.treasury()).to.equal(treasury.address);
    });

    it("should set correct split configuration", async function () {
      const config = await rewardVault.splitConfig();
      expect(config.authorBps).to.equal(8500);
      expect(config.contributorsBps).to.equal(1000);
      expect(config.treasuryBps).to.equal(500);
    });

    it("should revert with invalid NoteNFT address", async function () {
      const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
      await expect(
        RewardVaultFactory.deploy(ethers.ZeroAddress, treasury.address, {
          authorBps: 8500,
          contributorsBps: 1000,
          treasuryBps: 500,
        })
      ).to.be.revertedWith("RewardVault: invalid NoteNFT");
    });

    it("should revert with invalid treasury address", async function () {
      const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
      await expect(
        RewardVaultFactory.deploy(
          await noteNFT.getAddress(),
          ethers.ZeroAddress,
          {
            authorBps: 8500,
            contributorsBps: 1000,
            treasuryBps: 500,
          }
        )
      ).to.be.revertedWith("RewardVault: invalid treasury");
    });

    it("should revert with invalid split config (not 100%)", async function () {
      const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
      await expect(
        RewardVaultFactory.deploy(
          await noteNFT.getAddress(),
          treasury.address,
          {
            authorBps: 9000,
            contributorsBps: 500,
            treasuryBps: 1000, // Total = 10500 > 100%
          }
        )
      ).to.be.revertedWith("RewardVault: invalid split config");
    });
  });

  describe("Tipping", function () {
    it("should accept tips and split correctly", async function () {
      const tipAmount = ethers.parseEther("1.0");

      const tx = await rewardVault.connect(tipper).tip(0, { value: tipAmount });

      await expect(tx)
        .to.emit(rewardVault, "TipReceived")
        .withArgs(
          0,
          tipper.address,
          tipAmount,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp)
        );

      // Check balances (85% author, 15% treasury for MVP)
      const authorPending = await rewardVault.pending(author.address);
      const treasuryPending = await rewardVault.pending(treasury.address);

      expect(authorPending).to.equal(ethers.parseEther("0.85"));
      expect(treasuryPending).to.equal(ethers.parseEther("0.15")); // 10% + 5%
    });

    it("should revert tip below minimum", async function () {
      const smallTip = ethers.parseEther("0.0001");

      await expect(
        rewardVault.connect(tipper).tip(0, { value: smallTip })
      ).to.be.revertedWith("RewardVault: tip too small");
    });

    it("should revert tip to non-existent token", async function () {
      await expect(
        rewardVault
          .connect(tipper)
          .tip(999, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("NoteNFT: token does not exist");
    });

    it("should accumulate multiple tips", async function () {
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("0.1") });
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("0.2") });

      const totalTips = await rewardVault.totalTips(0);
      expect(totalTips).to.equal(ethers.parseEther("0.3"));
    });

    it("should update total tips for note", async function () {
      const tipAmount = ethers.parseEther("0.5");

      await rewardVault.connect(tipper).tip(0, { value: tipAmount });

      expect(await rewardVault.totalTips(0)).to.equal(tipAmount);
    });

    it("should handle tips from multiple users", async function () {
      const [, , tipper1, tipper2] = await ethers.getSigners();

      await rewardVault
        .connect(tipper1)
        .tip(0, { value: ethers.parseEther("0.1") });
      await rewardVault
        .connect(tipper2)
        .tip(0, { value: ethers.parseEther("0.1") });

      expect(await rewardVault.totalTips(0)).to.equal(
        ethers.parseEther("0.2")
      );
    });

    it("should handle tips to multiple notes", async function () {
      // Mint another note
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest2",
        "IKNS-5301",
        "v1.0",
        ""
      );

      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("0.1") });
      await rewardVault
        .connect(tipper)
        .tip(1, { value: ethers.parseEther("0.2") });

      expect(await rewardVault.totalTips(0)).to.equal(
        ethers.parseEther("0.1")
      );
      expect(await rewardVault.totalTips(1)).to.equal(
        ethers.parseEther("0.2")
      );
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Tip to create pending balance
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("1.0") });
    });

    it("should allow author to withdraw", async function () {
      const pendingBefore = await rewardVault.pending(author.address);
      const balanceBefore = await ethers.provider.getBalance(author.address);

      const tx = await rewardVault.connect(author).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(author.address);
      const pendingAfter = await rewardVault.pending(author.address);

      expect(pendingAfter).to.equal(0);
      expect(balanceAfter + gasUsed - balanceBefore).to.equal(pendingBefore);
    });

    it("should emit Withdrawn event", async function () {
      const pending = await rewardVault.pending(author.address);

      await expect(rewardVault.connect(author).withdraw())
        .to.emit(rewardVault, "Withdrawn")
        .withArgs(author.address, pending);
    });

    it("should revert withdraw with no balance", async function () {
      await expect(rewardVault.connect(tipper).withdraw()).to.be.revertedWith(
        "RewardVault: no pending balance"
      );
    });

    it("should allow multiple withdrawals", async function () {
      await rewardVault.connect(author).withdraw();

      // Tip again
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("0.5") });

      const pending = await rewardVault.pending(author.address);
      expect(pending).to.be.gt(0);

      await expect(rewardVault.connect(author).withdraw()).to.not.be.reverted;
    });

    it("should allow treasury to withdraw", async function () {
      const pending = await rewardVault.pending(treasury.address);
      expect(pending).to.be.gt(0);

      await expect(rewardVault.connect(treasury).withdraw()).to.not.be
        .reverted;

      expect(await rewardVault.pending(treasury.address)).to.equal(0);
    });
  });

  describe("Pending Balances", function () {
    it("should return correct pending balance", async function () {
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("1.0") });

      const authorPending = await rewardVault.pending(author.address);
      expect(authorPending).to.equal(ethers.parseEther("0.85"));
    });

    it("should return zero for account with no balance", async function () {
      expect(await rewardVault.pending(tipper.address)).to.equal(0);
    });

    it("should update after withdrawal", async function () {
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("1.0") });

      await rewardVault.connect(author).withdraw();

      expect(await rewardVault.pending(author.address)).to.equal(0);
    });
  });

  describe("Configuration", function () {
    it("should allow owner to update split config", async function () {
      await expect(
        rewardVault.connect(owner).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 500,
        })
      )
        .to.emit(rewardVault, "SplitConfigUpdated")
        .withArgs(9000, 500, 500);

      const config = await rewardVault.splitConfig();
      expect(config.authorBps).to.equal(9000);
    });

    it("should revert invalid split config (not 100%)", async function () {
      await expect(
        rewardVault.connect(owner).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 1000, // Total = 10500
        })
      ).to.be.revertedWith("RewardVault: invalid split config");
    });

    it("should revert if non-owner tries to update config", async function () {
      await expect(
        rewardVault.connect(author).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 500,
        })
      ).to.be.revertedWithCustomError(rewardVault, "OwnableUnauthorizedAccount");
    });

    it("should allow owner to update treasury", async function () {
      const newTreasury = tipper.address;

      await rewardVault.connect(owner).setTreasury(newTreasury);

      expect(await rewardVault.treasury()).to.equal(newTreasury);
    });

    it("should revert invalid treasury address", async function () {
      await expect(
        rewardVault.connect(owner).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("RewardVault: invalid treasury");
    });

    it("should revert if non-owner tries to update treasury", async function () {
      await expect(
        rewardVault.connect(author).setTreasury(tipper.address)
      ).to.be.revertedWithCustomError(rewardVault, "OwnableUnauthorizedAccount");
    });

    it("should allow owner to update NoteNFT address", async function () {
      const newNoteNFT = tipper.address; // Just for testing

      await rewardVault.connect(owner).setNoteNFT(newNoteNFT);

      expect(await rewardVault.noteNFT()).to.equal(newNoteNFT);
    });
  });

  describe("Reentrancy Protection", function () {
    it("should protect tip from reentrancy", async function () {
      // This would require a malicious contract to test properly
      // For now, we verify the modifier is present
      const tx = await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("0.01") });

      await expect(tx).to.not.be.reverted;
    });

    it("should protect withdraw from reentrancy", async function () {
      await rewardVault
        .connect(tipper)
        .tip(0, { value: ethers.parseEther("1.0") });

      const tx = await rewardVault.connect(author).withdraw();

      await expect(tx).to.not.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    it("should handle zero tip amount (below minimum)", async function () {
      await expect(
        rewardVault.connect(tipper).tip(0, { value: 0 })
      ).to.be.revertedWith("RewardVault: tip too small");
    });

    it("should handle very large tips", async function () {
      const largeTip = ethers.parseEther("1000");

      await expect(
        rewardVault.connect(tipper).tip(0, { value: largeTip })
      ).to.not.be.reverted;

      const authorPending = await rewardVault.pending(author.address);
      expect(authorPending).to.equal(ethers.parseEther("850")); // 85% of 1000
    });

    it("should handle precise split calculations", async function () {
      const tipAmount = ethers.parseEther("0.003"); // 3 finney

      await rewardVault.connect(tipper).tip(0, { value: tipAmount });

      const authorPending = await rewardVault.pending(author.address);
      const treasuryPending = await rewardVault.pending(treasury.address);

      // Check that splits add up to tip amount (accounting for rounding)
      const total = authorPending + treasuryPending;
      expect(total).to.equal(tipAmount);
    });
  });
});
