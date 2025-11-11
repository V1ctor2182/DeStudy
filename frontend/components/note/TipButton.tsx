"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRewardVault } from "@/hooks/useRewardVault";
import { LoadingSpinner } from "../common/LoadingSpinner";

interface TipButtonProps {
  tokenId: bigint;
  onTipSuccess?: () => void;
  onTipError?: (error: Error) => void;
}

const PRESET_AMOUNTS = ["0.001", "0.005", "0.01", "0.05"];

export function TipButton({ tokenId, onTipSuccess, onTipError }: TipButtonProps) {
  const { isConnected } = useAccount();
  const { tip, isPending, isConfirming, isSuccess } = useRewardVault();
  const [selectedAmount, setSelectedAmount] = useState("0.001");
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const handleTip = async () => {
    try {
      const amount = useCustom ? customAmount : selectedAmount;
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid tip amount");
      }
      
      await tip(tokenId, amount);
      
      if (onTipSuccess) {
        onTipSuccess();
      }
    } catch (err) {
      console.error("Tip error:", err);
      if (onTipError) {
        onTipError(err as Error);
      }
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <h3 className="font-semibold mb-3">Send Tip</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your wallet to tip this note
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Send Tip</h3>

      {/* Preset Amounts */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setSelectedAmount(amount);
              setUseCustom(false);
            }}
            disabled={isPending || isConfirming}
            className={`px-3 py-2 text-sm rounded border transition ${
              !useCustom && selectedAmount === amount
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-300 hover:border-primary-600"
            }`}
          >
            {amount} ETH
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">Custom Amount</label>
        <input
          type="number"
          step="0.001"
          min="0"
          placeholder="0.0"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setUseCustom(true);
          }}
          disabled={isPending || isConfirming}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleTip}
        disabled={isPending || isConfirming}
        className="w-full btn-primary flex items-center justify-center"
      >
        {isPending && <LoadingSpinner size="sm" />}
        {isPending && <span className="ml-2">Preparing...</span>}
        {isConfirming && <LoadingSpinner size="sm" />}
        {isConfirming && <span className="ml-2">Confirming...</span>}
        {!isPending && !isConfirming && "Send Tip"}
      </button>

      {isPending && (
        <p className="text-xs text-gray-600 text-center mt-2">
          Please confirm the transaction in your wallet...
        </p>
      )}
      {isConfirming && (
        <p className="text-xs text-gray-600 text-center mt-2">
          Waiting for confirmation...
        </p>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-medium mb-1">Tip Distribution:</p>
        <ul className="space-y-1">
          <li>• 85% to note author</li>
          <li>• 10% to contributors pool</li>
          <li>• 5% to treasury</li>
        </ul>
      </div>
    </div>
  );
}
