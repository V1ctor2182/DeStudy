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

// Mock IPFS upload for local development
export async function uploadToIPFS(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
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
    url: `ipfs://${mockCID}`,
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

// For production, use Web3.Storage:
/*
import { Web3Storage } from "web3.storage";

export async function uploadToIPFS(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const client = new Web3Storage({
    token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN!,
  });

  const cid = await client.put([file], {
    onRootCidReady: () => {
      onProgress?.({
        loaded: file.size / 2,
        total: file.size,
        percentage: 50,
      });
    },
    onStoredChunk: (size) => {
      // Update progress
    },
  });

  onProgress?.({
    loaded: file.size,
    total: file.size,
    percentage: 100,
  });

  return {
    cid,
    size: file.size,
    url: `https://w3s.link/ipfs/${cid}`,
  };
}
*/
