# DeStudy Architecture

A decentralized platform for sharing and monetizing study notes as NFTs on the Base blockchain.

## Overview

DeStudy is a fully decentralized Web3 application with no traditional backend. All data is stored on-chain or on IPFS, and smart contracts handle all business logic.

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (Browser)                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (wagmi)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Upload  │  │  Explore │  │  Note    │  │     Profile      │ │
│  │   Page   │  │   Page   │  │  Detail  │  │      Page        │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐      ┌─────────────────────────────────────┐
│    IPFS Storage     │      │        Base Blockchain              │
│  (Pinata/Web3.Storage)│    │  ┌─────────────┐ ┌───────────────┐  │
│                     │      │  │  NoteNFT    │ │  RewardVault  │  │
│  • Note content     │      │  │  (ERC-721)  │ │  (Tipping)    │  │
│  • File storage     │      │  └─────────────┘ └───────────────┘  │
└─────────────────────┘      └─────────────────────────────────────┘
```

## Project Structure

```
DeStudy/
├── contracts/              # Hardhat project - Smart contracts
│   ├── contracts/          # Solidity source files
│   │   ├── NoteNFT.sol     # ERC-721 NFT contract
│   │   └── RewardVault.sol # Tipping & revenue distribution
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   ├── abis/               # Exported ABIs
│   └── deployments/        # Deployment addresses by network
│
├── frontend/               # Next.js 14 application
│   ├── app/                # App router pages
│   │   ├── page.tsx        # Home
│   │   ├── upload/         # Upload & mint notes
│   │   ├── explore/        # Browse all notes
│   │   ├── note/[id]/      # Note detail view
│   │   └── profile/        # User profile
│   ├── components/         # React components
│   │   ├── upload/         # FileUploader, MintForm
│   │   ├── note/           # NoteCard, TipButton, DeleteNoteButton
│   │   ├── layout/         # Header, Navigation
│   │   └── wallet/         # ConnectButton
│   ├── hooks/              # Custom React hooks
│   │   ├── useNoteContract.ts
│   │   ├── useRewardVault.ts
│   │   └── useIPFS.ts
│   ├── lib/                # Utilities
│   │   ├── contracts/      # ABIs and addresses
│   │   └── ipfs/           # IPFS client
│   └── config/             # Wagmi configuration
│
├── docs/                   # Documentation
└── package.json            # Monorepo workspace config
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14, React 18, TypeScript | UI & SSR |
| Styling | TailwindCSS | Utility-first CSS |
| Blockchain | wagmi 2.x, viem | Contract interactions |
| Wallet | Web3Modal 4.x | MetaMask, WalletConnect |
| Contracts | Solidity 0.8.20, Hardhat | Smart contract development |
| Storage | IPFS (Pinata/Web3.Storage) | Decentralized file storage |
| Chain | Base (Sepolia testnet) | Low-cost L2 |

## Smart Contracts

### NoteNFT (ERC-721)

Represents study notes as NFTs with on-chain metadata.

**Storage:**
```solidity
struct NoteMetadata {
    address author;      // Original creator
    string cid;          // IPFS content hash
    string courseId;     // e.g., "IKNS-5300"
    string version;      // e.g., "v1.0"
    string previewCid;   // Optional preview image
    uint256 createdAt;
    uint256 updatedAt;
}
```

**Key Functions:**
- `mintNote()` - Create new note NFT
- `updateNoteMetadata()` - Update CID/version (author only)
- `burnNote()` - Delete note (author only)
- `getNoteMetadata()` - Read metadata

### RewardVault

Manages tipping with pull-payment pattern for security.

**Revenue Split (default):**
- 85% → Note author
- 10% → Contributors (treasury in MVP)
- 5% → Platform treasury

**Key Functions:**
- `tip(tokenId)` - Send ETH tip to a note
- `withdraw()` - Claim pending balance
- `pending(address)` - Check claimable balance
- `totalTips(tokenId)` - Get total tips for note

## Data Flow

### Uploading a Note

```
1. User selects file → FileUploader validates (type, size ≤50MB)
2. File uploaded to IPFS → Returns CID
3. User enters courseId, version → MintForm
4. Transaction sent → NoteNFT.mintNote()
5. NFT minted → Metadata stored on-chain
```

### Viewing Notes

```
1. ExplorePage calls useTotalSupply()
2. For each tokenId: useNoteMetadata() + useTotalTips()
3. Content fetched from IPFS gateway via CID
4. Rendered in NoteCard components
```

### Tipping

```
1. User selects amount → TipButton
2. Transaction sent → RewardVault.tip(tokenId)
3. Contract splits payment → Updates pending balances
4. Author withdraws later → withdraw()
```

## Frontend Hooks

### useNoteContract

```typescript
mintNote(params)           // Write - mint new NFT
updateMetadata(id, cid)    // Write - update note
burnNote(tokenId)          // Write - delete note
useNoteMetadata(tokenId)   // Read - get metadata
useTotalSupply()           // Read - total notes count
```

### useRewardVault

```typescript
tip(tokenId, amount)       // Write - send tip
withdraw()                 // Write - claim balance
usePendingBalance(addr)    // Read - claimable amount
useTotalTips(tokenId)      // Read - total tips
```

### useIPFS

```typescript
upload(file)               // Upload to IPFS
progress, uploading, error // State management
```

## Configuration

### Networks

| Network | Chain ID | Use Case |
|---------|----------|----------|
| Hardhat | 31337 | Local development |
| Base Sepolia | 84532 | Testnet |
| Base | 8453 | Production |

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_NOTE_NFT_ADDRESS=0x...
NEXT_PUBLIC_REWARD_VAULT_ADDRESS=0x...
NEXT_PUBLIC_PINATA_JWT=...

# Contracts (.env)
DEPLOYER_PRIVATE_KEY=...
TREASURY_ADDRESS=...
```

## Key Design Decisions

1. **Hybrid Storage** - On-chain metadata + IPFS content for gas efficiency
2. **Pull Payments** - No direct transfers in RewardVault for security
3. **ERC-721** - Each note is unique, standard marketplace compatibility
4. **Monorepo** - Contracts and frontend stay in sync
5. **No Backend** - Fully decentralized, no centralized database

## Running Locally

```bash
# Terminal 1: Start local blockchain
cd contracts && npx hardhat node

# Terminal 2: Deploy contracts
cd contracts && npx hardhat run scripts/deploy.ts --network localhost

# Terminal 3: Start frontend
cd frontend && npm run dev
```

Or use the convenience scripts:
```bash
./start_all.sh   # Start everything
./stop_all.sh    # Stop all services
```
