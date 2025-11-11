# Frontend Component Specifications v0.1

**Date**: 2025-11-10
**Status**: Draft
**Framework**: Next.js 14+ (App Router), React 18+, TypeScript

---

## 1. Overview

This document specifies the frontend component architecture for DeStudy. The application follows a modular, composable component structure with clear separation of concerns.

---

## 2. Component Hierarchy

```
App
├── Providers
│   ├── WagmiProvider
│   ├── QueryClientProvider
│   └── ThemeProvider
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── ConnectButton
│   └── Footer
└── Pages
    ├── HomePage
    ├── UploadPage
    │   ├── FileUploader
    │   ├── MintForm
    │   └── TransactionStatus
    ├── ExplorePage
    │   ├── FilterBar
    │   ├── SortToggle
    │   └── NoteGrid
    │       └── NoteCard[]
    ├── NoteDetailPage
    │   ├── NoteHeader
    │   ├── IPFSPreview
    │   ├── TipButton
    │   └── TipHistory
    └── ProfilePage
        ├── UserInfo
        ├── MyNotes
        └── PendingBalance
```

---

## 3. Core Components

### 3.1 Layout Components

#### **Layout.tsx**
```typescript
// app/components/layout/Layout.tsx
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

**Props**:
- `children`: React children to render in main content area

**Styling**: Tailwind CSS with responsive container

---

#### **Header.tsx**
```typescript
// app/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { ConnectButton } from '../wallet/ConnectButton';
import { Navigation } from './Navigation';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          DeStudy
        </Link>
        <Navigation />
        <ConnectButton />
      </div>
    </header>
  );
}
```

**Features**:
- Sticky header on scroll
- Responsive layout
- Logo links to home
- Wallet connection in top right

---

#### **Navigation.tsx**
```typescript
// app/components/layout/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/upload', label: 'Upload' },
  { href: '/profile', label: 'Profile' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm font-medium transition-colors hover:text-blue-600 ${
            pathname === href ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
```

**Features**:
- Active link highlighting
- Hover states
- Mobile responsive (hamburger menu for mobile - TODO)

---

### 3.2 Wallet Components

#### **ConnectButton.tsx**
```typescript
// app/components/wallet/ConnectButton.tsx
'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useState } from 'react';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showOptions, setShowOptions] = useState(false);

  const connectMetaMask = () => {
    connect({ connector: new MetaMaskConnector() });
    setShowOptions(false);
  };

  const connectWalletConnect = () => {
    connect({
      connector: new WalletConnectConnector({
        options: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        },
      }),
    });
    setShowOptions(false);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-600 rounded-lg hover:bg-red-50 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
      >
        Connect Wallet
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={connectMetaMask}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition flex items-center gap-3"
          >
            <img src="/icons/metamask.svg" alt="MetaMask" className="w-5 h-5" />
            MetaMask
          </button>
          <button
            onClick={connectWalletConnect}
            className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition flex items-center gap-3"
          >
            <img src="/icons/walletconnect.svg" alt="WalletConnect" className="w-5 h-5" />
            WalletConnect
          </button>
        </div>
      )}
    </div>
  );
}
```

**Props**: None

**State**:
- `showOptions`: Boolean for dropdown visibility

**Features**:
- MetaMask and WalletConnect support
- Truncated address display
- Dropdown for wallet selection
- Disconnect button when connected

**Events**: `wallet_connected`, `wallet_disconnected` (telemetry)

---

### 3.3 Upload Components

#### **FileUploader.tsx**
```typescript
// app/components/upload/FileUploader.tsx
'use client';

import { useState, useRef } from 'react';
import { useIPFS } from '@/hooks/useIPFS';

interface FileUploaderProps {
  onUploadComplete: (cid: string, previewCid?: string) => void;
  onError: (error: Error) => void;
}

const ALLOWED_TYPES = ['application/pdf', 'text/markdown', 'image/png', 'image/jpeg'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function FileUploader({ onUploadComplete, onError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useIPFS();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      onError(new Error('Invalid file type. Allowed: PDF, Markdown, PNG, JPG'));
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_SIZE) {
      onError(new Error('File too large. Maximum size: 50MB'));
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      // Upload to IPFS
      const result = await upload(file, (progressValue) => {
        setProgress(progressValue);
      });

      // Generate preview if PDF (optional)
      let previewCid: string | undefined;
      if (file.type === 'application/pdf') {
        // TODO: Generate thumbnail using pdf.js
        // previewCid = await generatePdfThumbnail(file);
      }

      onUploadComplete(result.cid, previewCid);
    } catch (error) {
      onError(error as Error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* File Input */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file ? (
          <div>
            <p className="text-lg font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" /* ... upload icon ... */ />
            <p className="text-lg text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-2">PDF, MD, PNG, JPG (max 50MB)</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Upload to IPFS
        </button>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">{progress}% uploaded</p>
        </div>
      )}
    </div>
  );
}
```

**Props**:
- `onUploadComplete(cid, previewCid)`: Callback when upload succeeds
- `onError(error)`: Callback when upload fails

**State**:
- `file`: Selected file
- `uploading`: Upload in progress
- `progress`: Upload progress percentage

**Features**:
- Drag and drop support
- File type validation
- File size validation
- Upload progress indicator
- Preview generation for PDFs (future)

**Events**: `ipfs_upload_start`, `ipfs_upload_success`, `ipfs_upload_fail`

---

#### **MintForm.tsx**
```typescript
// app/components/upload/MintForm.tsx
'use client';

import { useState } from 'react';
import { useNoteContract } from '@/hooks/useNoteContract';

interface MintFormProps {
  cid: string;
  previewCid?: string;
  onMintSuccess: (tokenId: bigint) => void;
  onMintError: (error: Error) => void;
}

export function MintForm({ cid, previewCid, onMintSuccess, onMintError }: MintFormProps) {
  const [courseId, setCourseId] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [minting, setMinting] = useState(false);
  const { mintNote } = useNoteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId.trim()) {
      onMintError(new Error('Course ID is required'));
      return;
    }

    setMinting(true);

    try {
      const tokenId = await mintNote({
        cid,
        courseId: courseId.trim(),
        version: version.trim(),
        previewCid: previewCid || '',
      });

      onMintSuccess(tokenId);
    } catch (error) {
      onMintError(error as Error);
    } finally {
      setMinting(false);
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
          placeholder="e.g., IKNS-5300"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={50}
          required
        />
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={20}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={minting || !courseId.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {minting ? 'Minting...' : 'Mint Note NFT'}
      </button>
    </form>
  );
}
```

**Props**:
- `cid`: IPFS content CID
- `previewCid`: Optional preview image CID
- `onMintSuccess(tokenId)`: Callback when mint succeeds
- `onMintError(error)`: Callback when mint fails

**State**:
- `courseId`: Course identifier input
- `version`: Version string input
- `minting`: Mint transaction in progress

**Validation**:
- Course ID required
- Course ID max 50 chars
- Version max 20 chars

**Events**: `mint_submit`, `mint_success`, `mint_fail`

---

### 3.4 Note Display Components

#### **NoteCard.tsx**
```typescript
// app/components/note/NoteCard.tsx
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { formatEther } from 'viem';

interface NoteCardProps {
  id: string;
  author: string;
  courseId: string;
  version: string;
  previewCid?: string;
  totalTips: bigint;
  createdAt: bigint;
}

export function NoteCard({
  id,
  author,
  courseId,
  version,
  previewCid,
  totalTips,
  createdAt,
}: NoteCardProps) {
  const previewUrl = previewCid
    ? `https://w3s.link/ipfs/${previewCid}`
    : '/images/default-note.png';

  const timeAgo = formatDistanceToNow(Number(createdAt) * 1000, { addSuffix: true });

  return (
    <Link href={`/note/${id}`}>
      <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer">
        {/* Preview Image */}
        <div className="aspect-video bg-gray-100 relative">
          <img
            src={previewUrl}
            alt={`Note ${courseId}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{courseId}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {version}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            by {author.slice(0, 6)}...{author.slice(-4)}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{timeAgo}</span>
            <span className="font-medium text-blue-600">
              {formatEther(totalTips)} ETH tips
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Props**:
- `id`: Token ID
- `author`: Author address
- `courseId`: Course identifier
- `version`: Version string
- `previewCid`: Preview image CID (optional)
- `totalTips`: Total tips in wei
- `createdAt`: Creation timestamp

**Features**:
- Preview image with fallback
- Truncated author address
- Relative timestamp
- Tips amount formatted

**Events**: `note_view` (on click)

---

#### **TipButton.tsx**
```typescript
// app/components/note/TipButton.tsx
'use client';

import { useState } from 'react';
import { useRewardVault } from '@/hooks/useRewardVault';
import { parseEther } from 'viem';

interface TipButtonProps {
  tokenId: string;
  onTipSuccess: () => void;
  onTipError: (error: Error) => void;
}

const TIP_AMOUNTS = [0.001, 0.005, 0.01, 0.05];

export function TipButton({ tokenId, onTipSuccess, onTipError }: TipButtonProps) {
  const [amount, setAmount] = useState(TIP_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [tipping, setTipping] = useState(false);
  const { tip } = useRewardVault();

  const handleTip = async () => {
    const tipAmount = useCustom ? parseFloat(customAmount) : amount;

    if (isNaN(tipAmount) || tipAmount <= 0) {
      onTipError(new Error('Invalid tip amount'));
      return;
    }

    setTipping(true);

    try {
      await tip(tokenId, parseEther(tipAmount.toString()));
      onTipSuccess();
    } catch (error) {
      onTipError(error as Error);
    } finally {
      setTipping(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Tip the Author</h3>

      {/* Preset Amounts */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {TIP_AMOUNTS.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setAmount(preset);
              setUseCustom(false);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !useCustom && amount === preset
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset} ETH
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => setUseCustom(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Custom amount</span>
        </label>
        {useCustom && (
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="0.01"
            step="0.001"
            min="0.001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>

      {/* Tip Button */}
      <button
        onClick={handleTip}
        disabled={tipping}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {tipping ? 'Sending Tip...' : `Send Tip (${useCustom ? customAmount : amount} ETH)`}
      </button>
    </div>
  );
}
```

**Props**:
- `tokenId`: Note token ID
- `onTipSuccess()`: Callback when tip succeeds
- `onTipError(error)`: Callback when tip fails

**State**:
- `amount`: Selected preset amount
- `customAmount`: Custom tip amount
- `useCustom`: Use custom amount toggle
- `tipping`: Tip transaction in progress

**Features**:
- Preset tip amounts
- Custom amount input
- Real-time amount display
- Transaction status

**Events**: `tip_click`, `tip_success`, `tip_fail`

---

### 3.5 Explore Page Components

#### **FilterBar.tsx**
```typescript
// app/components/explore/FilterBar.tsx
'use client';

interface FilterBarProps {
  courseId: string;
  onCourseIdChange: (courseId: string) => void;
}

export function FilterBar({ courseId, onCourseIdChange }: FilterBarProps) {
  return (
    <div className="mb-6">
      <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Course
      </label>
      <input
        id="courseFilter"
        type="text"
        value={courseId}
        onChange={(e) => onCourseIdChange(e.target.value)}
        placeholder="e.g., IKNS-5300"
        className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
```

---

#### **SortToggle.tsx**
```typescript
// app/components/explore/SortToggle.tsx
'use client';

type SortOption = 'newest' | 'top-tipped';

interface SortToggleProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export function SortToggle({ sortBy, onSortChange }: SortToggleProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onSortChange('newest')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          sortBy === 'newest'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Newest
      </button>
      <button
        onClick={() => onSortChange('top-tipped')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          sortBy === 'top-tipped'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Top Tipped
      </button>
    </div>
  );
}
```

---

### 3.6 Common Components

#### **LoadingSpinner.tsx**
```typescript
// app/components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
    </div>
  );
}
```

---

#### **ErrorMessage.tsx**
```typescript
// app/components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ title = 'Error', message, onRetry }: ErrorMessageProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

---

## 4. Custom Hooks

### 4.1 useNoteContract

```typescript
// app/hooks/useNoteContract.ts
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { NOTE_NFT_ABI } from '@/lib/contracts/abis';
import { NOTE_NFT_ADDRESS } from '@/lib/contracts/addresses';

interface MintNoteParams {
  cid: string;
  courseId: string;
  version: string;
  previewCid: string;
}

export function useNoteContract() {
  const { write, data: writeData, isLoading: isWriting } = useContractWrite({
    address: NOTE_NFT_ADDRESS,
    abi: NOTE_NFT_ABI,
    functionName: 'mintNote',
  });

  const { isLoading: isWaiting } = useWaitForTransaction({
    hash: writeData?.hash,
  });

  const mintNote = async (params: MintNoteParams): Promise<bigint> => {
    return new Promise((resolve, reject) => {
      write(
        {
          args: [
            params.cid,
            params.courseId,
            params.version,
            params.previewCid,
          ],
        },
        {
          onSuccess: (data) => {
            // Extract tokenId from event logs
            const tokenId = data.logs[0].topics[1]; // Simplified
            resolve(BigInt(tokenId));
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  return {
    mintNote,
    isLoading: isWriting || isWaiting,
  };
}
```

---

### 4.2 useRewardVault

```typescript
// app/hooks/useRewardVault.ts
import { useContractWrite, useContractRead } from 'wagmi';
import { parseEther } from 'viem';
import { REWARD_VAULT_ABI } from '@/lib/contracts/abis';
import { REWARD_VAULT_ADDRESS } from '@/lib/contracts/addresses';

export function useRewardVault() {
  const { write: tipWrite } = useContractWrite({
    address: REWARD_VAULT_ADDRESS,
    abi: REWARD_VAULT_ABI,
    functionName: 'tip',
  });

  const tip = async (tokenId: string, amount: bigint) => {
    return new Promise((resolve, reject) => {
      tipWrite(
        {
          args: [BigInt(tokenId)],
          value: amount,
        },
        {
          onSuccess: resolve,
          onError: reject,
        }
      );
    });
  };

  const usePendingBalance = (address: string) => {
    const { data } = useContractRead({
      address: REWARD_VAULT_ADDRESS,
      abi: REWARD_VAULT_ABI,
      functionName: 'pending',
      args: [address],
      watch: true, // Poll for updates
    });

    return data as bigint | undefined;
  };

  return { tip, usePendingBalance };
}
```

---

### 4.3 useIPFS

```typescript
// app/hooks/useIPFS.ts
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN!
});

export function useIPFS() {
  const upload = async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ cid: string; size: number }> => {
    try {
      const cid = await client.put([file], {
        onRootCidReady: () => {
          onProgress?.(50); // Halfway
        },
        onStoredChunk: () => {
          // Update progress incrementally
        },
      });

      onProgress?.(100);

      return {
        cid,
        size: file.size,
      };
    } catch (error) {
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  };

  return { upload };
}
```

---

### 4.4 useSubgraph

```typescript
// app/hooks/useSubgraph.ts
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL!;

export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const query = gql`
        query GetNote($id: ID!) {
          note(id: $id) {
            id
            author
            cid
            courseId
            version
            createdAt
            totalTips
            payments {
              id
              from
              amount
              timestamp
            }
          }
        }
      `;
      return request(SUBGRAPH_URL, query, { id });
    },
  });
}

export function useNotes(sortBy: 'newest' | 'top-tipped', limit = 20) {
  return useQuery({
    queryKey: ['notes', sortBy, limit],
    queryFn: async () => {
      const orderBy = sortBy === 'newest' ? 'createdAt' : 'totalTips';
      const query = gql`
        query GetNotes($orderBy: String!, $limit: Int!) {
          notes(
            first: $limit
            orderBy: $orderBy
            orderDirection: desc
          ) {
            id
            author
            cid
            courseId
            version
            previewCid
            totalTips
            createdAt
          }
        }
      `;
      return request(SUBGRAPH_URL, query, { orderBy, limit });
    },
  });
}
```

---

## 5. Styling Guide

**Design System**:
- **Colors**:
  - Primary: `#2563EB` (blue-600)
  - Secondary: `#6B7280` (gray-600)
  - Success: `#10B981` (green-500)
  - Error: `#EF4444` (red-500)
  - Background: `#FFFFFF` (white)
  - Border: `#E5E7EB` (gray-200)

- **Typography**:
  - Headings: `font-semibold`, `font-bold`
  - Body: `text-sm`, `text-base`
  - Small: `text-xs`

- **Spacing**:
  - Use Tailwind spacing scale (4px increments)
  - Container: `max-w-7xl mx-auto px-4`

- **Rounded Corners**: `rounded-lg` (0.5rem)

**Responsive Breakpoints**:
- Mobile: default (< 640px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

---

## 6. Accessibility Guidelines

- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Provide alt text for images
- Use proper form labels (`htmlFor`)
- Ensure keyboard navigation (tab order)
- ARIA labels for interactive elements
- Color contrast ratio ≥ 4.5:1
- Focus states for all interactive elements

---

## 7. Performance Optimizations

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: `loading="lazy"` for images below fold
- **Memoization**: `React.memo`, `useMemo`, `useCallback` for expensive renders
- **Virtualization**: (Future) React Virtual for long lists

---

## 8. Testing Strategy

- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: Test hooks with contract mocks
- **E2E Tests**: Playwright for user flows
- **Visual Regression**: (Future) Chromatic or Percy

---

**Document Version**: 0.1
**Last Updated**: 2025-11-10
**Next Review**: After frontend implementation (D10)
