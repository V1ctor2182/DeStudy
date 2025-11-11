"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { DeleteNoteButton } from "./DeleteNoteButton";

interface NoteCardProps {
  tokenId: bigint;
  author: string;
  courseId: string;
  version: string;
  cid: string;
  totalTips: bigint;
  createdAt: bigint;
  onDelete?: () => void;
}

export function NoteCard({
  tokenId,
  author,
  courseId,
  version,
  cid,
  totalTips,
  createdAt,
  onDelete,
}: NoteCardProps) {
  const timeAgo = getTimeAgo(Number(createdAt) * 1000);
  const { address } = useAccount();
  const isAuthor = address && address.toLowerCase() === author.toLowerCase();

  return (
    <div className="card hover:shadow-lg transition h-full flex flex-col">
      <Link href={`/note/${tokenId.toString()}`} className="flex-1 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{courseId}</h3>
            <p className="text-sm text-gray-500 font-mono">
              {author.slice(0, 6)}...{author.slice(-4)}
            </p>
          </div>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {version}
          </span>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
            <div className="text-3xl mb-1">📄</div>
            <p className="text-xs text-gray-500">Stored on IPFS</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
          <span className="text-gray-500">{timeAgo}</span>
          <span className="font-medium text-primary-600">
            {formatEther(totalTips)} ETH
          </span>
        </div>
      </Link>

      {/* Delete Button (only for author) */}
      {isAuthor && (
        <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          <DeleteNoteButton tokenId={tokenId} onDeleteSuccess={onDelete} compact />
        </div>
      )}
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
