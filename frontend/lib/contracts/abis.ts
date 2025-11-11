import NoteNFTArtifact from "./NoteNFT.abi.json";
import RewardVaultArtifact from "./RewardVault.abi.json";

// Extract just the ABI arrays from the artifacts
export const NOTE_NFT_ABI = NoteNFTArtifact.abi;
export const REWARD_VAULT_ABI = RewardVaultArtifact.abi;
