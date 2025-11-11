"use client";

import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { FileUploader } from "@/components/upload/FileUploader";
import { MintForm } from "@/components/upload/MintForm";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function UploadPage() {
  const [cid, setCid] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const handleUploadComplete = (uploadedCid: string) => {
    setCid(uploadedCid);
    setError(null);
  };

  const handleUploadError = (err: Error) => {
    setError(err.message);
  };

  const handleMintSuccess = (hash: string) => {
    setTxHash(hash);
    setError(null);
  };

  const handleMintError = (err: Error) => {
    setError(err.message);
  };

  const handleReset = () => {
    setCid(null);
    setTxHash(null);
    setError(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Notes</h1>
        <p className="text-gray-600 mb-8">
          Upload your study notes to IPFS and mint them as an NFT
        </p>

        {/* Wallet Connection Check */}
        {!isConnected && (
          <div className="card mb-8 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800">
              Please connect your wallet to upload and mint notes.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="card mb-8 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {txHash && (
          <div className="card mb-8 bg-green-50 border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Success! 🎉</h3>
            <p className="text-green-700 text-sm mb-4">
              Your note has been minted successfully!
            </p>
            <p className="text-xs text-green-600 font-mono break-all mb-4">
              Transaction: {txHash}
            </p>
            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-secondary text-sm">
                Upload Another
              </button>
              <Link href="/explore" className="btn-primary text-sm">
                View in Explore
              </Link>
            </div>
          </div>
        )}

        {/* Step 1: Upload to IPFS */}
        {!txHash && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-xl font-semibold">Upload to IPFS</h2>
            </div>

            <FileUploader
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </div>
        )}

        {/* Step 2: Mint NFT */}
        {cid && !txHash && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-xl font-semibold">Mint NFT</h2>
            </div>

            <div className="card mb-4 bg-green-50 border-green-200">
              <p className="text-green-800 text-sm">
                ✅ File uploaded to IPFS successfully!
              </p>
            </div>

            <MintForm
              cid={cid}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
            />
          </div>
        )}

        {/* Help Section */}
        {!cid && !txHash && (
          <div className="mt-12 card bg-gray-50">
            <h3 className="font-semibold mb-3">Tips for uploading notes:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Supported formats: PDF, Markdown, PNG, JPG</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Use clear course identifiers (e.g., CS101, MATH-201)</li>
              <li>• Include version numbers to track updates (e.g., v1.0, v2.1)</li>
              <li>• Your notes will be permanently stored on IPFS</li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
