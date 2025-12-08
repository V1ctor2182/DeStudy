# DeStudy Technical Architecture

## 1. System Overview

DeStudy is a decentralized note-sharing platform that enables users to upload study notes to IPFS, mint them as NFTs, and receive tips. The system consists of four main components:

1. **Frontend Application** (Next.js + React)
2. **Smart Contracts** (Solidity on EVM-compatible chains)
3. **Decentralized Storage** (IPFS)
4. **Indexing Layer** (The Graph)

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Upload  │  │  Explore │  │  Detail  │  │  Profile │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└───────┬─────────────────┬─────────────────┬────────────────┘
        │                 │                 │
        │ wagmi/viem      │ GraphQL        │ Web3.storage
        │                 │                 │
┌───────▼─────────┐  ┌────▼─────────┐  ┌──▼─────────┐
│  Smart          │  │  The Graph   │  │   IPFS     │
│  Contracts      │  │  Subgraph    │  │  Network   │
│                 │  │              │  │            │
│ • NoteNFT       │◄─┤ • Indexer    │  │ • Storage  │
│ • RewardVault   │  │ • Mappings   │  │ • Gateway  │
│ • AccessMarket  │  │              │  │            │
└─────────────────┘  └──────────────┘  └────────────┘
        │
        │ Events
        │
┌───────▼─────────────────────────────────┐
│   Blockchain (Polygon Amoy / Base)      │
└─────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Application

**Tech Stack**:
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- wagmi v2 + viem
- Tailwind CSS
- React Query (for caching)

**Key Modules**:

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home/Landing
│   ├── upload/
│   │   └── page.tsx              # Upload & Mint flow
│   ├── explore/
│   │   └── page.tsx              # Browse notes
│   └── note/
│       └── [id]/
│           └── page.tsx          # Note detail
├── components/
│   ├── wallet/
│   │   └── ConnectButton.tsx    # Wallet connection
│   ├── upload/
│   │   ├── FileUploader.tsx     # IPFS upload
│   │   └── MintForm.tsx         # Mint parameters
│   ├── note/
│   │   ├── NoteCard.tsx         # Note preview card
│   │   ├── NoteDetail.tsx       # Full note view
│   │   └── TipButton.tsx        # Tipping UI
│   └── common/
│       ├── Layout.tsx
│       └── ErrorBoundary.tsx
├── hooks/
│   ├── useNoteContract.ts       # NoteNFT interactions
│   ├── useRewardVault.ts        # Tipping logic
│   ├── useIPFS.ts               # IPFS operations
│   └── useSubgraph.ts           # Graph queries
├── lib/
│   ├── contracts/               # Contract ABIs & addresses
│   ├── ipfs/                    # IPFS client
│   ├── graphql/                 # Graph queries
│   └── utils/
└── config/
    ├── chains.ts                # Network configs
    └── wagmi.ts                 # wagmi config
```

**State Management**:
- **Local State**: React hooks for component state
- **Server State**: React Query for async data (subgraph queries)
- **Wallet State**: wagmi for wallet connection and contract interactions
- **URL State**: Next.js routing for shareable links

**Data Flow (Upload → Mint)**:
1. User selects file → `FileUploader` component
2. File uploaded to IPFS via `useIPFS` hook → returns CID
3. User fills mint form (courseId, version, preview)
4. `useNoteContract` hook calls `mintNote` with parameters
5. Transaction submitted → user sees pending state
6. On confirmation → redirect to note detail page
7. Subgraph indexes event → note appears in explore

### 2.2 Smart Contracts

**Deployment Architecture**:

```
contracts/
├── NoteNFT.sol              # Main NFT contract
├── RewardVault.sol          # Revenue split & tipping
├── AccessMarket.sol         # Paid unlock (optional)
├── interfaces/
│   ├── INoteNFT.sol
│   ├── IRewardVault.sol
│   └── IAccessMarket.sol
├── libraries/
│   └── RevenueSplit.sol     # Split calculation logic
└── mocks/
    └── MockERC20.sol        # For testing
```

**Contract Dependencies**:

```
NoteNFT
├── ERC721URIStorage (OpenZeppelin)
├── Ownable (OpenZeppelin)
├── ReentrancyGuard (OpenZeppelin)
└── EIP2981 (optional, for royalties)

RewardVault
├── ReentrancyGuard
├── Ownable
└── PullPayment pattern

AccessMarket
├── ReentrancyGuard
└── Ownable
```

**Access Control**:
- **Owner Role**: Can update platform fee, split ratios, pause contracts
- **Minter Role**: Anyone (open minting for MVP)
- **Upgradeability**: Not in MVP (deploy new versions if needed)

### 2.3 IPFS Integration

**Storage Provider**: Web3.storage or Pinata

**Upload Flow**:
1. **Client-side**: Direct upload from browser (preferred for MVP)
   - Pros: No backend needed, faster
   - Cons: API key exposed (use read-only or rate-limited key)

2. **Server-side** (optional): Proxy through API route
   - Pros: API key security, additional validation
   - Cons: Extra latency, server cost

**File Structure on IPFS**:
```
/{noteId}/
  content.pdf          # Main content (CID stored on-chain)
  preview.png          # Preview image (optional)
  metadata.json        # NFT metadata (follows schema from PRD §6.1)
```

**Gateway Strategy**:
- Primary: `https://w3s.link/ipfs/{cid}` (Web3.storage)
- Fallback: `https://ipfs.io/ipfs/{cid}` (public gateway)
- Retry logic: 3 attempts with exponential backoff

### 2.4 The Graph Subgraph

**Schema**:
```graphql
type Note @entity {
  id: ID!                      # tokenId
  tokenId: BigInt!
  author: Bytes!
  cid: String!
  courseId: String!
  version: String!
  previewCid: String
  createdAt: BigInt!
  totalTips: BigInt!
  tipCount: Int!
  payments: [Payment!]! @derivedFrom(field: "note")
}

type Payment @entity {
  id: ID!                      # txHash-logIndex
  note: Note!
  from: Bytes!
  amount: BigInt!
  type: PaymentType!
  txHash: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
}

enum PaymentType {
  TIP
  BUY
}

type PlatformStats @entity {
  id: ID!                      # "platform"
  totalNotes: Int!
  totalTips: BigInt!
  totalPayments: Int!
  uniqueCreators: Int!
  uniqueTippers: Int!
}
```

**Event Handlers**:
- `handleNoteMinted`: Creates Note entity
- `handleTipReceived`: Creates Payment entity, updates Note.totalTips
- `handlePurchase`: Creates Payment entity (type=BUY)

**Queries**:
```graphql
# Get note by ID
query GetNote($id: ID!) {
  note(id: $id) {
    id
    author
    cid
    courseId
    version
    createdAt
    totalTips
    payments(orderBy: timestamp, orderDirection: desc) {
      id
      from
      amount
      type
      timestamp
    }
  }
}

# Get top tipped notes
query GetTopNotes($first: Int!, $skip: Int!) {
  notes(
    first: $first
    skip: $skip
    orderBy: totalTips
    orderDirection: desc
  ) {
    id
    author
    cid
    courseId
    version
    totalTips
    createdAt
  }
}

# Get newest notes
query GetNewestNotes($first: Int!, $skip: Int!) {
  notes(
    first: $first
    skip: $skip
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    author
    cid
    courseId
    version
    totalTips
    createdAt
  }
}
```

---

## 3. Data Flow Diagrams

### 3.1 Upload → Mint Flow

```
User                Frontend              IPFS                Blockchain           Subgraph
 │                     │                   │                      │                  │
 │  Select File        │                   │                      │                  │
 ├────────────────────►│                   │                      │                  │
 │                     │                   │                      │                  │
 │                     │  Upload File      │                      │                  │
 │                     ├──────────────────►│                      │                  │
 │                     │                   │                      │                  │
 │                     │  Return CID       │                      │                  │
 │                     │◄──────────────────┤                      │                  │
 │                     │                   │                      │                  │
 │  Fill Mint Form     │                   │                      │                  │
 ├────────────────────►│                   │                      │                  │
 │                     │                   │                      │                  │
 │  Approve Tx         │  mintNote()       │                      │                  │
 │◄────────────────────┤                   │                      │                  │
 │                     ├──────────────────────────────────────────►│                  │
 │                     │                   │                      │                  │
 │                     │                   │  NoteMinted Event    │                  │
 │                     │                   │                      ├─────────────────►│
 │                     │                   │                      │                  │
 │  Show Success       │                   │                      │  Index Event     │
 │◄────────────────────┤                   │                      │  Create Note     │
 │                     │                   │                      │                  │
 │  Redirect to        │                   │                      │                  │
 │  Note Detail        │                   │                      │                  │
 │◄────────────────────┤                   │                      │                  │
```

### 3.2 Tip Flow

```
User                Frontend           RewardVault          NoteNFT              Subgraph
 │                     │                   │                   │                   │
 │  Click Tip Button   │                   │                   │                   │
 ├────────────────────►│                   │                   │                   │
 │                     │                   │                   │                   │
 │                     │  Get Note Author  │                   │                   │
 │                     ├───────────────────────────────────────►│                   │
 │                     │                   │                   │                   │
 │                     │  Return Author    │                   │                   │
 │                     │◄───────────────────────────────────────┤                   │
 │                     │                   │                   │                   │
 │  Approve Tx         │  tip(tokenId)     │                   │                   │
 │◄────────────────────┤  {value: amount}  │                   │                   │
 │                     ├──────────────────►│                   │                   │
 │                     │                   │                   │                   │
 │                     │                   │  Split Payment    │                   │
 │                     │                   │  Update Pending   │                   │
 │                     │                   │                   │                   │
 │                     │                   │  TipReceived      │                   │
 │                     │                   │  Event            ├──────────────────►│
 │                     │                   │                   │                   │
 │  Show Success       │                   │                   │  Index Event      │
 │◄────────────────────┤                   │                   │  Update totalTips │
 │                     │                   │                   │                   │
 │  Update UI          │  Query Subgraph   │                   │                   │
 │◄────────────────────┤──────────────────────────────────────────────────────────►│
 │                     │                   │                   │                   │
```

---

## 4. Security Architecture

### 4.1 Smart Contract Security

**Reentrancy Protection**:
- All state changes before external calls
- OpenZeppelin's `ReentrancyGuard` on:
  - `NoteNFT.mintNote`
  - `RewardVault.tip`
  - `RewardVault.withdraw`
  - `AccessMarket.buy`

**Access Control**:
- `Ownable` pattern for admin functions
- Principle of least privilege
- No upgradeability in MVP (immutable)

**Pull Payment Pattern**:
- `RewardVault` accumulates pending balances
- Users call `withdraw()` to claim
- No automatic transfers in `tip()`

**Integer Overflow/Underflow**:
- Solidity 0.8.x default checks
- SafeMath not needed

**Input Validation**:
- Check `tokenId` exists
- Check `amount > 0`
- Check split ratios sum to 100%
- Validate string lengths (cid, courseId, version)

### 4.2 Frontend Security

**Wallet Security**:
- Never request private keys
- Use wagmi/viem for signing
- Show clear transaction previews

**Input Validation**:
- File type whitelist: PDF, MD, PNG, JPG
- File size limit: 50MB
- Sanitize user inputs (courseId, version)

**API Key Management**:
- IPFS API keys in environment variables
- Use read-only or rate-limited keys for client-side
- Rotate keys regularly

**XSS Prevention**:
- React auto-escapes by default
- Sanitize IPFS content in iframe/preview
- CSP headers for additional protection

### 4.3 IPFS Security

**Content Validation**:
- Verify file types before upload
- Check file size limits
- Scan for known malware hashes (future)

**Pinning Strategy**:
- Pin all uploaded content
- Monitor pin status
- Backup to multiple pinning services (future)

---

## 5. Performance & Scalability

### 5.1 Frontend Optimization

**Code Splitting**:
- Route-based splitting (Next.js default)
- Dynamic imports for heavy components
- Lazy load IPFS preview

**Caching Strategy**:
- React Query for API/subgraph data
- `staleTime: 5000ms`, `cacheTime: 300000ms`
- CDN caching for static assets

**Image Optimization**:
- Next.js Image component
- WebP format with fallbacks
- Lazy loading below fold

**Target Metrics**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse Score > 90

### 5.2 Blockchain Scalability

**Network Selection**:
- MVP: Polygon Amoy (testnet) or Base Sepolia
- Production: Polygon PoS or Base (low fees)

**Gas Optimization**:
- Batch operations where possible
- Efficient storage patterns (pack structs)
- Use events instead of storage for history

**Rate Limiting**:
- Client-side: 1 mint per 30s
- Smart contract: No hard limits (let gas be the limiter)

### 5.3 IPFS Performance

**Upload Optimization**:
- Chunked uploads for large files
- Progress tracking
- Retry with exponential backoff

**Retrieval Optimization**:
- Multiple gateway fallbacks
- Preload preview images
- Cache CIDs in browser storage

---

## 6. Deployment Architecture

### 6.1 Environments

| Environment | Frontend | Contracts | IPFS | Subgraph |
|------------|----------|-----------|------|----------|
| **Local** | localhost:3000 | Hardhat network | Local node | Local graph-node |
| **Testnet** | Vercel preview | Polygon Amoy / Base Sepolia | Web3.storage | Hosted Service |
| **Production** | Vercel production | Polygon PoS / Base | Web3.storage | Decentralized Network |

### 6.2 CI/CD Pipeline

```
GitHub
  │
  ├── Pull Request
  │     ├── Lint (ESLint, Prettier, Solhint)
  │     ├── Type Check (TypeScript)
  │     ├── Unit Tests (Jest)
  │     ├── Contract Tests (Hardhat)
  │     └── Preview Deploy (Vercel)
  │
  └── Merge to main
        ├── Build Frontend
        ├── Deploy Contracts (if changed)
        ├── Deploy Subgraph (if changed)
        └── Deploy to Production (Vercel)
```

### 6.3 Infrastructure

**Frontend Hosting**: Vercel
- Automatic deployments
- Edge functions for API routes
- Environment variables management

**Contract Deployment**: Hardhat scripts
- Deterministic addresses (CREATE2, optional)
- Verification on Etherscan/Basescan
- Deployment logs stored in `deployments/`

**IPFS Pinning**: Web3.storage
- Generous free tier (5GB)
- Reliable pinning
- Fast gateways

**Subgraph Hosting**: The Graph Hosted Service (MVP) → Decentralized Network (future)

---

## 7. Monitoring & Observability

### 7.1 Application Monitoring

**Frontend**:
- Vercel Analytics (Web Vitals)
- Sentry (error tracking)
- Custom events (wallet_connected, mint_success, tip_click)

**Contracts**:
- Event logs via subgraph
- Transaction monitoring (Tenderly/Blocknative)
- Gas usage tracking

### 7.2 Key Metrics

**Operational**:
- API response time (p50, p95, p99)
- IPFS upload success rate
- Transaction success rate
- Subgraph sync lag

**Business**:
- Daily Active Users (DAU)
- Notes minted per day
- Tips per day (volume & count)
- Median tip value
- Creator retention (W1, W4)

### 7.3 Alerting

**Critical Alerts**:
- Contract pause/emergency
- Subgraph sync stopped
- IPFS pinning failures
- Frontend error rate > 5%

**Warning Alerts**:
- Subgraph lag > 5 minutes
- Transaction failure rate > 10%
- API response time > 3s

---

## 8. Testing Strategy

See [TESTING_STRATEGY.md](../testing/TESTING_STRATEGY.md) for detailed testing approach.

**Coverage Targets**:
- Smart Contracts: 100% (all branches)
- Frontend Components: 80%
- Integration Tests: Critical paths covered
- E2E Tests: Core user flows (upload, tip, explore)

---

## 9. Disaster Recovery

### 9.1 Data Backup

**IPFS**:
- All content is content-addressed (immutable)
- Multiple pinning services (future)
- Backup CIDs to off-chain database (future)

**Blockchain**:
- Immutable on-chain data
- Contract addresses stored in version control
- Subgraph can rebuild from chain events

**Frontend**:
- Source code in Git
- Environment variables in secure storage
- Regular backups of configuration

### 9.2 Emergency Procedures

**Contract Emergency**:
1. Pause contract (if pausable)
2. Assess issue
3. Deploy fix or migrate to new contract
4. Communicate with users

**Frontend Outage**:
1. Check Vercel status
2. Rollback to previous deployment
3. Use backup hosting (Netlify, Fleek)

**IPFS Outage**:
1. Switch to fallback gateway
2. Verify pinning service status
3. Re-pin critical content if needed

---

## 10. Future Enhancements (Post-MVP)

**Scalability**:
- Batch minting for multiple notes
- Off-chain metadata storage with on-chain hash
- Layer 2 optimistic rollups

**Features**:
- Full-text search (Meilisearch/Algolia)
- Collaborative editing & version control
- Reputation system & leaderboards
- Advanced revenue sharing (ERC-2981 royalties)

**Decentralization**:
- DAO governance for platform parameters
- Decentralized moderation
- Token incentives for curators

---

## 11. Open Issues & Decisions

1. **IPFS Provider**: Web3.storage vs Pinata vs Fleek
   - **Decision**: Web3.storage (generous free tier, good DX)

2. **Network**: Polygon Amoy vs Base Sepolia for testnet
   - **Decision**: Base Sepolia (faster, better tooling)

3. **Metadata Storage**: On-chain vs IPFS vs both
   - **Decision**: Core on-chain, full metadata on IPFS

4. **Preview Generation**: Client-side vs server-side
   - **Decision**: Client-side (PDF.js for thumbnails)

5. **Authentication**: Wallet-only vs Email backup
   - **Decision**: Wallet-only for MVP (simplicity)
