import { Layout } from "@/components/layout/Layout";
import Link from "next/link";

export default function HomePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Turn Study Notes into Digital Assets
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Upload to IPFS → Mint as NFT → Earn tips from learners
        </p>

        <div className="flex gap-4 justify-center mb-16">
          <Link
            href="/upload"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-lg"
          >
            Upload Notes
          </Link>
          <Link
            href="/explore"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-lg"
          >
            Explore Notes
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="card">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Upload & Mint</h3>
            <p className="text-gray-600">
              Turn your class notes into verifiable NFTs stored on IPFS
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Earn Tips</h3>
            <p className="text-gray-600">
              Get rewarded when learners find your notes helpful
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Discover</h3>
            <p className="text-gray-600">
              Browse quality notes sorted by newest or top-tipped
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-primary-50 rounded-lg border border-primary-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="text-left max-w-2xl mx-auto space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Connect Your Wallet</h4>
                <p className="text-gray-600">
                  Use MetaMask or WalletConnect to get started
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Upload Your Notes</h4>
                <p className="text-gray-600">
                  Select your PDF or Markdown file and upload to IPFS
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Mint as NFT</h4>
                <p className="text-gray-600">
                  Create an NFT with course ID and version info
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Share & Earn</h4>
                <p className="text-gray-600">
                  Learners can tip you for your helpful content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
