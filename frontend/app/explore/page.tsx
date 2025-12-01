"use client";

import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { NoteCard } from "@/components/note/NoteCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useTotalSupply, useNoteMetadata } from "@/hooks/useNoteContract";
import { useTotalTips } from "@/hooks/useRewardVault";

type SortOption = "newest" | "oldest" | "most-tipped" | "least-tipped";

export default function ExplorePage() {
  const { totalSupply, isLoading } = useTotalSupply();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [categories, setCategories] = useState<string[]>([]);

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

  // Create array of token IDs (0 to totalSupply-1)
  const tokenIds = Array.from({ length: noteCount }, (_, i) => BigInt(i));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Notes</h1>
          <p className="text-gray-600">
            {noteCount} {noteCount === 1 ? "note" : "notes"} available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by course ID or author address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Courses</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-tipped">Most Tipped</option>
                <option value="least-tipped">Least Tipped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <NotesGrid
          tokenIds={tokenIds}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          sortBy={sortBy}
          onCategoriesLoaded={setCategories}
        />
      </div>
    </Layout>
  );
}

// Component to handle filtering and sorting
function NotesGrid({
  tokenIds,
  searchTerm,
  selectedCategory,
  sortBy,
  onCategoriesLoaded,
}: {
  tokenIds: bigint[];
  searchTerm: string;
  selectedCategory: string;
  sortBy: SortOption;
  onCategoriesLoaded: (categories: string[]) => void;
}) {
  const [notesData, setNotesData] = useState<
    Array<{
      tokenId: bigint;
      metadata: any;
      totalTips: bigint;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  // This will be populated as notes load
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      notesData.map((note) => note.metadata?.courseId).filter(Boolean)
    );
    const categoriesArray = Array.from(uniqueCategories).sort();
    // Notify parent component
    onCategoriesLoaded(categoriesArray);
    return categoriesArray;
  }, [notesData, onCategoriesLoaded]);

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notesData.filter((note) => {
      if (!note.metadata) return false;

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        note.metadata.courseId.toLowerCase().includes(searchLower) ||
        note.metadata.author.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || note.metadata.courseId === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return Number(b.metadata.createdAt) - Number(a.metadata.createdAt);
        case "oldest":
          return Number(a.metadata.createdAt) - Number(b.metadata.createdAt);
        case "most-tipped":
          return Number(b.totalTips) - Number(a.totalTips);
        case "least-tipped":
          return Number(a.totalTips) - Number(b.totalTips);
        default:
          return 0;
      }
    });

    return filtered;
  }, [notesData, searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokenIds.map((tokenId) => (
          <NoteCardWithData
            key={tokenId.toString()}
            tokenId={tokenId}
            onDataLoaded={(metadata, totalTips) => {
              setNotesData((prev) => {
                const exists = prev.find((n) => n.tokenId === tokenId);
                if (exists) return prev;
                const newData = [...prev, { tokenId, metadata, totalTips }];
                if (newData.length === tokenIds.length) {
                  setLoading(false);
                }
                return newData;
              });
            }}
            shouldDisplay={filteredAndSortedNotes.some((n) => n.tokenId === tokenId)}
          />
        ))}
      </div>

      {!loading && filteredAndSortedNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </>
  );
}

// Wrapper component to fetch data for each note card
function NoteCardWithData({
  tokenId,
  onDataLoaded,
  shouldDisplay,
}: {
  tokenId: bigint;
  onDataLoaded: (metadata: any, totalTips: bigint) => void;
  shouldDisplay: boolean;
}) {
  const { metadata, isLoading: metadataLoading } = useNoteMetadata(tokenId);
  const { totalTips } = useTotalTips(tokenId);

  // Notify parent when data is loaded (only once)
  useEffect(() => {
    if (metadata && totalTips !== undefined) {
      onDataLoaded(metadata, totalTips || BigInt(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata, totalTips]);

  if (metadataLoading || !metadata) {
    return (
      <div className="card h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Hide if filtered out
  if (!shouldDisplay) {
    return null;
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
