"use client";

import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { TipButton } from "@/components/note/TipButton";
import { DeleteNoteButton } from "@/components/note/DeleteNoteButton";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useNoteMetadata, useAuthorOf } from "@/hooks/useNoteContract";
import { useTotalTips } from "@/hooks/useRewardVault";
import { formatEther } from "viem";
import { useState } from "react";

export default function NoteDetailPage() {
  const params = useParams();
  const tokenId = params.id ? BigInt(params.id as string) : undefined;
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipError, setTipError] = useState<string | null>(null);

  const { metadata, isLoading: metadataLoading } = useNoteMetadata(tokenId);
  const { author } = useAuthorOf(tokenId);
  const { totalTips, refetch: refetchTips } = useTotalTips(tokenId);

  if (tokenId === undefined) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-gray-600">Invalid note ID</p>
        </div>
      </Layout>
    );
  }

  if (metadataLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!metadata) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Note Not Found</h1>
          <p className="text-gray-600">This note does not exist or has not been minted yet.</p>
        </div>
      </Layout>
    );
  }

  const handleTipSuccess = () => {
    setTipSuccess(true);
    setTipError(null);
    refetchTips();
    setTimeout(() => setTipSuccess(false), 5000);
  };

  const handleTipError = (error: Error) => {
    setTipError(error.message);
    setTimeout(() => setTipError(null), 5000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{metadata.courseId}</h1>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {metadata.version}
            </span>
          </div>
          <p className="text-gray-600">Note #{tokenId.toString()}</p>
        </div>

        {/* Success/Error Messages */}
        {tipSuccess && (
          <div className="card mb-6 bg-green-50 border-green-200">
            <p className="text-green-800 font-medium">🎉 Tip sent successfully!</p>
          </div>
        )}

        {tipError && (
          <div className="card mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{tipError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metadata Card */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Metadata</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600">Author</dt>
                  <dd className="font-mono text-sm mt-1">
                    {metadata.author}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Course ID</dt>
                  <dd className="font-medium mt-1">{metadata.courseId}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Version</dt>
                  <dd className="font-medium mt-1">{metadata.version}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">IPFS CID</dt>
                  <dd className="font-mono text-sm mt-1 break-all">{metadata.cid}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Created</dt>
                  <dd className="mt-1">
                    {new Date(Number(metadata.createdAt) * 1000).toLocaleDateString()}
                  </dd>
                </div>
                {metadata.previewCid && (
                  <div>
                    <dt className="text-sm text-gray-600">Preview CID</dt>
                    <dd className="font-mono text-sm mt-1 break-all">
                      {metadata.previewCid}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Content Preview */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Content</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📄</div>
                <p className="text-gray-600 mb-2">
                  Content CID (Mock for MVP)
                </p>
                <p className="text-xs text-gray-500 mb-4 font-mono break-all px-4">
                  {metadata.cid}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>MVP Note:</strong> This is using mock IPFS for local development.
                  </p>
                  <p className="text-xs text-blue-700">
                    For production, integrate with Web3.Storage or Pinata to store actual files on IPFS.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {totalTips ? formatEther(totalTips) : "0"} ETH
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Tips</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">#{tokenId.toString()}</div>
                  <div className="text-sm text-gray-600 mt-1">Token ID</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <TipButton
              tokenId={tokenId}
              onTipSuccess={handleTipSuccess}
              onTipError={handleTipError}
            />

            {/* Delete Note Button */}
            <DeleteNoteButton tokenId={tokenId} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
