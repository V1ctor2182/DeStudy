"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useNoteContract, useAuthorOf } from "@/hooks/useNoteContract";
import { useRouter } from "next/navigation";

interface DeleteNoteButtonProps {
  tokenId: bigint;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
  compact?: boolean;
}

export function DeleteNoteButton({
  tokenId,
  onDeleteSuccess,
  onDeleteError,
  compact = false,
}: DeleteNoteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { address } = useAccount();
  const { author } = useAuthorOf(tokenId);
  const { burnNote, isPending, isConfirming, isSuccess, error } = useNoteContract();
  const router = useRouter();

  // Only show delete button if user is the author
  const isAuthor = address && author && address.toLowerCase() === author.toLowerCase();

  const handleDelete = async () => {
    try {
      await burnNote(tokenId);
      setShowConfirm(false);

      // Wait for confirmation
      setTimeout(() => {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          // Default: navigate to profile
          router.push("/profile");
        }
      }, 2000);
    } catch (err) {
      console.error("Delete error:", err);
      if (onDeleteError) {
        onDeleteError(err as Error);
      }
    }
  };

  if (!isAuthor) {
    return null;
  }

  if (showConfirm) {
    return (
      <div className={`${compact ? "inline-flex gap-2" : "card bg-red-50 border-red-200"}`}>
        {!compact && (
          <p className="text-sm text-red-800 mb-3">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={isPending || isConfirming}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
          >
            {isPending && "Preparing..."}
            {isConfirming && "Confirming..."}
            {!isPending && !isConfirming && "Yes, Delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending || isConfirming}
            className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={
        compact
          ? "px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
          : "px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
      }
    >
      Delete Note
    </button>
  );
}
