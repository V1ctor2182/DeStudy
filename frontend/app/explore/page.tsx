"use client";

import { Layout } from "@/components/layout/Layout";
import { NoteCard } from "@/components/note/NoteCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTotalSupply, useNoteMetadata } from "@/hooks/useNoteContract";
import { useTotalTips } from "@/hooks/useRewardVault";

export default function ExplorePage() {
  const { totalSupply, isLoading } = useTotalSupply();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const noteCount = totalSupply ? Number(totalSupply) : 0;

  if (noteCount === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Notes Yet</h1>
          <p className="text-gray-600 mb-8">
            Be the first to upload and mint study notes!
          </p>
          <a href="/upload" className="btn-primary inline-block">
            Upload Notes
          </a>
        </div>
      </Layout>
    );
  }

  // Create array of token IDs (0 to totalSupply-1) in reverse order (newest first)
  const tokenIds = Array.from({ length: noteCount }, (_, i) => BigInt(noteCount - 1 - i));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Notes</h1>
            <p className="text-gray-600">
              Browse all study notes uploaded to the platform
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokenIds.map((tokenId) => (
            <NoteCardWithData key={tokenId.toString()} tokenId={tokenId} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Wrapper component to fetch data for each note card
function NoteCardWithData({ tokenId }: { tokenId: bigint }) {
  const { metadata, isLoading: metadataLoading, error } = useNoteMetadata(tokenId);
  const { totalTips } = useTotalTips(tokenId);

  // If token doesn't exist (was burned), don't render anything
  if (error) {
    return null;
  }

  if (metadataLoading || !metadata) {
    return (
      <div className="card h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleDelete = () => {
    // Refresh the page to update the list
    window.location.reload();
  };

  return (
    <NoteCard
      tokenId={tokenId}
      author={metadata.author}
      courseId={metadata.courseId}
      version={metadata.version}
      cid={metadata.cid}
      totalTips={totalTips || BigInt(0)}
      createdAt={metadata.createdAt}
      onDelete={handleDelete}
    />
  );
}
