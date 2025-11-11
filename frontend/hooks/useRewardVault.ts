"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { REWARD_VAULT_ADDRESS } from "@/lib/contracts/addresses";
import { REWARD_VAULT_ABI } from "@/lib/contracts/abis";
import { parseEther } from "viem";

export function useRewardVault() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const tip = async (tokenId: bigint, amount: string) => {
    const value = parseEther(amount);
    return writeContract({
      address: REWARD_VAULT_ADDRESS,
      abi: REWARD_VAULT_ABI,
      functionName: "tip",
      args: [tokenId],
      value,
    });
  };

  const withdraw = async () => {
    return writeContract({
      address: REWARD_VAULT_ADDRESS,
      abi: REWARD_VAULT_ABI,
      functionName: "withdraw",
    });
  };

  return {
    tip,
    withdraw,
    hash,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}

// Hook to get pending balance for an address
export function usePendingBalance(address?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: REWARD_VAULT_ADDRESS,
    abi: REWARD_VAULT_ABI,
    functionName: "pending",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    pendingBalance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get total tips for a note
export function useTotalTips(tokenId?: bigint) {
  const { data, isLoading, refetch } = useReadContract({
    address: REWARD_VAULT_ADDRESS,
    abi: REWARD_VAULT_ABI,
    functionName: "totalTips",
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
    },
  });

  return {
    totalTips: data as bigint | undefined,
    isLoading,
    refetch,
  };
}
