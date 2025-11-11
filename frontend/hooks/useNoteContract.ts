"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { NOTE_NFT_ADDRESS } from "@/lib/contracts/addresses";
import { NOTE_NFT_ABI } from "@/lib/contracts/abis";

export function useNoteContract() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintNote = async (params: {
    to: `0x${string}`;
    cid: string;
    courseId: string;
    version: string;
    previewCid?: string;
  }) => {
    return writeContract({
      address: NOTE_NFT_ADDRESS,
      abi: NOTE_NFT_ABI,
      functionName: "mintNote",
      args: [
        params.to,
        params.cid,
        params.courseId,
        params.version,
        params.previewCid || "",
      ],
    });
  };

  const updateMetadata = async (params: {
    tokenId: bigint;
    newCid: string;
    newVersion: string;
  }) => {
    return writeContract({
      address: NOTE_NFT_ADDRESS,
      abi: NOTE_NFT_ABI,
      functionName: "updateNoteMetadata",
      args: [params.tokenId, params.newCid, params.newVersion],
    });
  };

  const burnNote = async (tokenId: bigint) => {
    return writeContract({
      address: NOTE_NFT_ADDRESS,
      abi: NOTE_NFT_ABI,
      functionName: "burnNote",
      args: [tokenId],
    });
  };

  return {
    mintNote,
    updateMetadata,
    burnNote,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Hook to read note metadata
export function useNoteMetadata(tokenId?: bigint) {
  const { data, isLoading, error } = useReadContract({
    address: NOTE_NFT_ADDRESS,
    abi: NOTE_NFT_ABI,
    functionName: "getNoteMetadata",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });

  return {
    metadata: data as any,
    isLoading,
    error,
  };
}

// Hook to get total supply
export function useTotalSupply() {
  const { data, isLoading } = useReadContract({
    address: NOTE_NFT_ADDRESS,
    abi: NOTE_NFT_ABI,
    functionName: "totalSupply",
  });

  return {
    totalSupply: data as bigint | undefined,
    isLoading,
  };
}

// Hook to get author of a note
export function useAuthorOf(tokenId?: bigint) {
  const { data, isLoading } = useReadContract({
    address: NOTE_NFT_ADDRESS,
    abi: NOTE_NFT_ABI,
    functionName: "authorOf",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });

  return {
    author: data as `0x${string}` | undefined,
    isLoading,
  };
}
