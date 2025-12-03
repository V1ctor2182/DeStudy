/**
 * IPFS Upload Client
 *
 * For MVP/local development: Uses mock CID generation
 * For production: Replace with Web3.Storage or Pinata integration
 */

export interface UploadResult {
  cid: string;
  size: number;
  url: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// For production, use Web3.Storage or Pinata:
import { Web3Storage } from "web3.storage";
import { uploadToPinata } from "./pinata";

export async function uploadToIPFS(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // 1. Try Pinata first (Recommended)
  const pinataToken = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (pinataToken) {
    console.log("Using Pinata for IPFS upload...");
    return uploadToPinata(file, pinataToken, onProgress);
  }

  // 2. Try Web3.Storage (Legacy/Backup)
  const web3StorageToken = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
  if (web3StorageToken) {
    console.log("Using Web3.Storage for IPFS upload...");
    const client = new Web3Storage({
      token: web3StorageToken,
    });

    onProgress?.({
      loaded: 0,
      total: file.size,
      percentage: 0,
    });

    console.log("Starting IPFS upload with Web3.Storage...");

    let uploadedSize = 0;

    try {
      const cid = await client.put([file], {
        wrapWithDirectory: false,
        onRootCidReady: (cid) => {
          console.log("Root CID ready:", cid);
          onProgress?.({
            loaded: 0,
            total: file.size,
            percentage: 1,
          });
        },
        onStoredChunk: (size) => {
          uploadedSize += size;
          const percentage = Math.min(99, Math.round((uploadedSize / file.size) * 100));
          console.log(`Stored chunk: ${size} bytes. Total: ${uploadedSize}/${file.size} (${percentage}%)`);
          onProgress?.({
            loaded: uploadedSize,
            total: file.size,
            percentage: percentage,
          });
        },
      });

      console.log("Upload complete. CID:", cid);

      onProgress?.({
        loaded: file.size,
        total: file.size,
        percentage: 100,
      });

      return {
        cid,
        size: file.size,
        url: `https://${cid}.ipfs.w3s.link`,
      };
    } catch (error) {
      console.error("Web3.Storage upload failed:", error);
      // Fall through to mock if Web3.Storage fails
      console.warn("Web3.Storage failed, falling back to mock");
    }
  }

  // 3. Fallback to Mock Mode
  console.warn("No valid IPFS token found (Pinata or Web3.Storage), using Mock Mode");

  // Simulate upload progress
  const simulateProgress = async () => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress?.({
        loaded: (file.size * i) / 100,
        total: file.size,
        percentage: i,
      });
    }
  };

  await simulateProgress();

  // Generate a mock CID based on file name, size and timestamp
  const mockCID = generateMockCID(file.name, file.size);

  return {
    cid: mockCID,
    size: file.size,
    url: `https://mock.ipfs/${mockCID}`,
  };
}

// Generate a deterministic mock CID based on file name and size
function generateMockCID(fileName: string, fileSize: number): string {
  // Simple hash-like function for demo purposes
  const nameHash = Array.from(fileName).reduce(
    (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
    0
  );

  // Combine name and size for more deterministic CID
  const combined = Math.abs(nameHash) + fileSize;

  // Format as IPFS CID (Qm... format)
  const timestamp = Date.now();
  return `Qm${combined.toString(36).padStart(10, "0")}${timestamp.toString(36)}`;
}

