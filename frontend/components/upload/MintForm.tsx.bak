"use client";

import { useState, useEffect } from "react";
import { useNoteContract } from "@/hooks/useNoteContract";
import { useAccount, usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { NOTE_NFT_ABI } from "@/lib/contracts/abis";

interface MintFormProps {
  cid: string;
  onMintSuccess: (hash: string) => void;
  onMintError: (error: Error) => void;
}

export function MintForm({ cid, onMintSuccess, onMintError }: MintFormProps) {
  const [courseId, setCourseId] = useState("");
  const [version, setVersion] = useState("v1.0");
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const { address } = useAccount();
  const { mintNote, hash, isPending, isConfirming, isSuccess, error } = useNoteContract();
  const publicClient = usePublicClient();

  useEffect(() => {
    const extractTokenId = async () => {
      if (isSuccess && hash && publicClient) {
        try {
          // Get transaction receipt
          const receipt = await publicClient.getTransactionReceipt({ hash });

          // Find the NoteMinted event
          const noteMintedLog = receipt.logs.find((log) => {
            try {
              const decoded = decodeEventLog({
                abi: NOTE_NFT_ABI,
                data: log.data,
                topics: log.topics as any,
              });
              return decoded.eventName === "NoteMinted";
            } catch {
              return false;
            }
          });

          if (noteMintedLog) {
            const decoded = decodeEventLog({
              abi: NOTE_NFT_ABI,
              data: noteMintedLog.data,
              topics: noteMintedLog.topics as any,
            });

            if (decoded.eventName === "NoteMinted" && decoded.args) {
              const tokenId = (decoded.args as any).tokenId as bigint;
              setMintedTokenId(tokenId);
            }
          }

          onMintSuccess(hash);
        } catch (err) {
          console.error("Error extracting token ID:", err);
          onMintSuccess(hash);
        }
      }
    };

    extractTokenId();
  }, [isSuccess, hash, onMintSuccess, publicClient]);

  useEffect(() => {
    if (error) {
      onMintError(error as Error);
    }
  }, [error, onMintError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId.trim()) {
      onMintError(new Error("Course ID is required"));
      return;
    }

    if (!address) {
      onMintError(new Error("Please connect your wallet"));
      return;
    }

    try {
      await mintNote({
        to: address,
        cid,
        courseId: courseId.trim(),
        version: version.trim(),
        previewCid: "",
      });
    } catch (err) {
      // Error is handled by useEffect
      console.error("Mint error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-6">
      {/* CID Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content CID
        </label>
        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-mono break-all">
          {cid}
        </div>
      </div>

      {/* Course ID */}
      <div>
        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
          Course ID *
        </label>
        <input
          id="courseId"
          type="text"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="e.g., IKNS-5300 or CS101"
          className="input"
          maxLength={50}
          required
          disabled={isPending || isConfirming}
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the course code or identifier for these notes
        </p>
      </div>

      {/* Version */}
      <div>
        <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
          Version
        </label>
        <input
          id="version"
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="e.g., v1.0"
          className="input"
          maxLength={20}
          disabled={isPending || isConfirming}
        />
        <p className="text-xs text-gray-500 mt-1">
          Version number for tracking updates
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || isConfirming || !courseId.trim()}
        className="w-full btn-primary"
      >
        {isPending && "Preparing transaction..."}
        {isConfirming && "Confirming..."}
        {!isPending && !isConfirming && "Mint Note NFT"}
      </button>

      {/* Status Messages */}
      {isPending && (
        <p className="text-sm text-gray-600 text-center">
          Please confirm the transaction in your wallet...
        </p>
      )}
      {isConfirming && (
        <p className="text-sm text-gray-600 text-center">
          Waiting for confirmation on the blockchain...
        </p>
      )}

      {/* Success Message with Token ID */}
      {isSuccess && mintedTokenId !== null && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl">✓</div>
            <h3 className="text-lg font-semibold text-green-900">
              Note NFT Minted Successfully!
            </h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-green-800">Token ID:</p>
              <p className="text-lg font-mono text-green-900">
                #{mintedTokenId.toString()}
              </p>
            </div>
            {hash && (
              <div>
                <p className="text-sm font-medium text-green-800">Transaction Hash:</p>
                <p className="text-xs font-mono text-green-700 break-all">
                  {hash}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
