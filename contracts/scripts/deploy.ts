import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address))
  );

  // Get treasury address from env or use deployer
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  console.log("Treasury address:", treasuryAddress);

  // Deploy NoteNFT
  console.log("\n📝 Deploying NoteNFT...");
  const NoteNFTFactory = await ethers.getContractFactory("NoteNFT");
  const noteNFT = await NoteNFTFactory.deploy(
    "DeStudy Note",
    "DNOTE",
    "ipfs://"
  );
  await noteNFT.waitForDeployment();
  const noteNFTAddress = await noteNFT.getAddress();
  console.log("✅ NoteNFT deployed to:", noteNFTAddress);

  // Deploy RewardVault
  console.log("\n💰 Deploying RewardVault...");
  const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
  const rewardVault = await RewardVaultFactory.deploy(
    noteNFTAddress,
    treasuryAddress,
    {
      authorBps: 8500, // 85%
      contributorsBps: 1000, // 10%
      treasuryBps: 500, // 5%
    }
  );
  await rewardVault.waitForDeployment();
  const rewardVaultAddress = await rewardVault.getAddress();
  console.log("✅ RewardVault deployed to:", rewardVaultAddress);

  // Save deployment addresses
  const network = await ethers.provider.getNetwork();
  const deployments = {
    network: network.name,
    chainId: Number(network.chainId),
    noteNFT: noteNFTAddress,
    rewardVault: rewardVaultAddress,
    treasury: treasuryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(
    deploymentsDir,
    `${network.name}-${network.chainId}.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log("\n📄 Deployment info saved to:", deploymentPath);
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:      ", network.name);
  console.log("Chain ID:     ", network.chainId);
  console.log("NoteNFT:      ", noteNFTAddress);
  console.log("RewardVault:  ", rewardVaultAddress);
  console.log("Treasury:     ", treasuryAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Export ABIs for frontend
  console.log("\n📦 Exporting ABIs...");
  const artifactsDir = path.join(__dirname, "../artifacts/contracts");
  const abiExportDir = path.join(__dirname, "../abis");

  if (!fs.existsSync(abiExportDir)) {
    fs.mkdirSync(abiExportDir, { recursive: true });
  }

  // Export NoteNFT ABI
  const noteNFTArtifact = JSON.parse(
    fs.readFileSync(
      path.join(artifactsDir, "NoteNFT.sol/NoteNFT.json"),
      "utf8"
    )
  );
  fs.writeFileSync(
    path.join(abiExportDir, "NoteNFT.json"),
    JSON.stringify(
      {
        address: noteNFTAddress,
        abi: noteNFTArtifact.abi,
      },
      null,
      2
    )
  );

  // Export RewardVault ABI
  const rewardVaultArtifact = JSON.parse(
    fs.readFileSync(
      path.join(artifactsDir, "RewardVault.sol/RewardVault.json"),
      "utf8"
    )
  );
  fs.writeFileSync(
    path.join(abiExportDir, "RewardVault.json"),
    JSON.stringify(
      {
        address: rewardVaultAddress,
        abi: rewardVaultArtifact.abi,
      },
      null,
      2
    )
  );

  console.log("✅ ABIs exported to:", abiExportDir);

  // Print verification commands
  console.log("\n🔍 To verify contracts on Etherscan, run:");
  console.log(
    `npx hardhat verify --network ${network.name} ${noteNFTAddress} "DeStudy Note" "DNOTE" "ipfs://"`
  );
  console.log(
    `npx hardhat verify --network ${network.name} ${rewardVaultAddress} ${noteNFTAddress} ${treasuryAddress} '{"authorBps":8500,"contributorsBps":1000,"treasuryBps":500}'`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
