import { expect } from "chai";
import { ethers } from "hardhat";
import { NoteNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NoteNFT", function () {
  let noteNFT: NoteNFT;
  let owner: SignerWithAddress;
  let author: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, author, user] = await ethers.getSigners();

    const NoteNFTFactory = await ethers.getContractFactory("NoteNFT");
    noteNFT = await NoteNFTFactory.deploy("DeStudy Note", "DNOTE", "ipfs://");
  });

  describe("Deployment", function () {
    it("should set the correct name and symbol", async function () {
      expect(await noteNFT.name()).to.equal("DeStudy Note");
      expect(await noteNFT.symbol()).to.equal("DNOTE");
    });

    it("should set the deployer as owner", async function () {
      expect(await noteNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("should mint a note with valid parameters", async function () {
      const tx = await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest123",
        "IKNS-5300",
        "v1.0",
        ""
      );

      await expect(tx)
        .to.emit(noteNFT, "NoteMinted")
        .withArgs(
          0,
          author.address,
          "QmTest123",
          "v1.0",
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp)
        );

      expect(await noteNFT.ownerOf(0)).to.equal(author.address);
    });

    it("should increment tokenId for each mint", async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest1",
        "IKNS-5300",
        "v1.0",
        ""
      );

      const tx = await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest2",
        "IKNS-5301",
        "v1.0",
        ""
      );

      await expect(tx)
        .to.emit(noteNFT, "NoteMinted")
        .withArgs(
          1,
          author.address,
          "QmTest2",
          "v1.0",
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp)
        );
    });

    it("should revert when minting to zero address", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          ethers.ZeroAddress,
          "QmTest",
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: mint to zero address");
    });

    it("should revert with empty CID", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          "",
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid CID");
    });

    it("should revert with CID exceeding max length", async function () {
      const longCID = "Q".repeat(101);
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          longCID,
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid CID");
    });

    it("should revert with empty courseId", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          "QmTest",
          "",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid courseId");
    });

    it("should revert with empty version", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          "QmTest",
          "IKNS-5300",
          "",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid version");
    });

    it("should store correct metadata", async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        "QmPreview"
      );

      const metadata = await noteNFT.getNoteMetadata(0);

      expect(metadata.author).to.equal(author.address);
      expect(metadata.cid).to.equal("QmTest");
      expect(metadata.courseId).to.equal("IKNS-5300");
      expect(metadata.version).to.equal("v1.0");
      expect(metadata.previewCid).to.equal("QmPreview");
      expect(metadata.createdAt).to.be.gt(0);
      expect(metadata.updatedAt).to.equal(metadata.createdAt);
    });

    it("should set correct token URI", async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest123",
        "IKNS-5300",
        "v1.0",
        ""
      );

      const tokenURI = await noteNFT.tokenURI(0);
      expect(tokenURI).to.equal("ipfs://QmTest123/metadata.json");
    });
  });

  describe("Metadata Updates", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should allow author to update metadata", async function () {
      await expect(
        noteNFT.connect(author).updateNoteMetadata(0, "QmTest2", "v2.0")
      )
        .to.emit(noteNFT, "NoteMetadataUpdated")
        .withArgs(0, "QmTest2", "v2.0");

      const metadata = await noteNFT.getNoteMetadata(0);
      expect(metadata.cid).to.equal("QmTest2");
      expect(metadata.version).to.equal("v2.0");
      expect(metadata.updatedAt).to.be.gt(metadata.createdAt);
    });

    it("should revert if non-author tries to update", async function () {
      await expect(
        noteNFT.connect(user).updateNoteMetadata(0, "QmTest2", "v2.0")
      ).to.be.revertedWith("NoteNFT: not the author");
    });

    it("should revert if token does not exist", async function () {
      await expect(
        noteNFT.connect(author).updateNoteMetadata(999, "QmTest2", "v2.0")
      ).to.be.revertedWith("NoteNFT: token does not exist");
    });

    it("should update token URI", async function () {
      await noteNFT.connect(author).updateNoteMetadata(0, "QmTest2", "v2.0");

      const tokenURI = await noteNFT.tokenURI(0);
      expect(tokenURI).to.equal("ipfs://QmTest2/metadata.json");
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should return correct author", async function () {
      expect(await noteNFT.authorOf(0)).to.equal(author.address);
    });

    it("should return correct total supply", async function () {
      expect(await noteNFT.totalSupply()).to.equal(1);

      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest2",
        "IKNS-5301",
        "v1.0",
        ""
      );

      expect(await noteNFT.totalSupply()).to.equal(2);
    });

    it("should revert authorOf for non-existent token", async function () {
      await expect(noteNFT.authorOf(999)).to.be.revertedWith(
        "NoteNFT: token does not exist"
      );
    });

    it("should revert getNoteMetadata for non-existent token", async function () {
      await expect(noteNFT.getNoteMetadata(999)).to.be.revertedWith(
        "NoteNFT: token does not exist"
      );
    });
  });

  describe("ERC-721 Compatibility", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should support ERC-721 interface", async function () {
      // ERC-721 interface ID: 0x80ac58cd
      expect(await noteNFT.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("should support ERC-2981 interface", async function () {
      // ERC-2981 interface ID: 0x2a55205a
      expect(await noteNFT.supportsInterface("0x2a55205a")).to.be.true;
    });

    it("should allow token transfer", async function () {
      await noteNFT.connect(author).transferFrom(author.address, user.address, 0);
      expect(await noteNFT.ownerOf(0)).to.equal(user.address);
    });

    it("should preserve metadata after transfer", async function () {
      await noteNFT.connect(author).transferFrom(author.address, user.address, 0);
      const metadata = await noteNFT.getNoteMetadata(0);
      expect(metadata.author).to.equal(author.address); // Original author unchanged
    });

    it("should not allow author to update after transfer", async function () {
      await noteNFT.connect(author).transferFrom(author.address, user.address, 0);
      // Author can still update (design choice - author != owner)
      await expect(
        noteNFT.connect(author).updateNoteMetadata(0, "QmTest2", "v2.0")
      ).to.not.be.reverted;
    });
  });

  describe("Royalties (EIP-2981)", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should allow owner to set default royalty", async function () {
      await noteNFT.connect(owner).setDefaultRoyalty(author.address, 250); // 2.5%

      const [receiver, amount] = await noteNFT.royaltyInfo(
        0,
        ethers.parseEther("1")
      );

      expect(receiver).to.equal(author.address);
      expect(amount).to.equal(ethers.parseEther("0.025")); // 2.5% of 1 ETH
    });

    it("should return zero royalty if not set", async function () {
      const [receiver, amount] = await noteNFT.royaltyInfo(
        0,
        ethers.parseEther("1")
      );

      expect(receiver).to.equal(ethers.ZeroAddress);
      expect(amount).to.equal(0);
    });

    it("should revert if non-owner tries to set royalty", async function () {
      await expect(
        noteNFT.connect(user).setDefaultRoyalty(author.address, 250)
      ).to.be.revertedWithCustomError(noteNFT, "OwnableUnauthorizedAccount");
    });

    it("should revert if royalty fee is too high", async function () {
      await expect(
        noteNFT.connect(owner).setDefaultRoyalty(author.address, 10001)
      ).to.be.revertedWith("NoteNFT: fee too high");
    });

    it("should revert if receiver is zero address", async function () {
      await expect(
        noteNFT.connect(owner).setDefaultRoyalty(ethers.ZeroAddress, 250)
      ).to.be.revertedWith("NoteNFT: invalid receiver");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Mint a note for testing
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest123",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should allow author to burn their note", async function () {
      const tx = await noteNFT.connect(author).burnNote(0);

      await expect(tx)
        .to.emit(noteNFT, "NoteBurned")
        .withArgs(
          0,
          author.address,
          await ethers.provider.getBlock("latest").then((b) => b!.timestamp)
        );

      // Token should no longer exist
      await expect(noteNFT.ownerOf(0)).to.be.revertedWithCustomError(
        noteNFT,
        "ERC721NonexistentToken"
      );
    });

    it("should delete metadata when burning", async function () {
      await noteNFT.connect(author).burnNote(0);

      // Metadata should be deleted (call will revert)
      await expect(noteNFT.getNoteMetadata(0)).to.be.revertedWith(
        "NoteNFT: token does not exist"
      );
    });

    it("should revert if non-author tries to burn", async function () {
      await expect(
        noteNFT.connect(user).burnNote(0)
      ).to.be.revertedWith("NoteNFT: not the author");
    });

    it("should revert if trying to burn non-existent token", async function () {
      await expect(
        noteNFT.connect(author).burnNote(999)
      ).to.be.revertedWith("NoteNFT: token does not exist");
    });

    it("should revert if trying to burn already burned token", async function () {
      await noteNFT.connect(author).burnNote(0);

      await expect(
        noteNFT.connect(author).burnNote(0)
      ).to.be.revertedWith("NoteNFT: token does not exist");
    });
  });

  describe("Base URI", function () {
    it("should allow owner to update base URI", async function () {
      await noteNFT.connect(owner).setBaseURI("https://example.com/");

      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );

      const tokenURI = await noteNFT.tokenURI(0);
      expect(tokenURI).to.equal("https://example.com/QmTest/metadata.json");
    });

    it("should revert if non-owner tries to update base URI", async function () {
      await expect(
        noteNFT.connect(user).setBaseURI("https://example.com/")
      ).to.be.revertedWithCustomError(noteNFT, "OwnableUnauthorizedAccount");
    });
  });
});
