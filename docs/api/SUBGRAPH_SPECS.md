# Subgraph Specifications


## 1. Overview

This document specifies the subgraph configuration for indexing DeStudy smart contracts. The subgraph indexes `NoteNFT` and `RewardVault` events to provide queryable data for the frontend.

---

## 2. Schema Definition

### 2.1 schema.graphql

```graphql
type Note @entity {
  """Unique identifier (tokenId)"""
  id: ID!

  """Token ID as BigInt"""
  tokenId: BigInt!

  """Author/creator address"""
  author: Bytes!

  """IPFS content CID"""
  cid: String!

  """Course identifier (e.g., 'IKNS-5300')"""
  courseId: String!

  """Version string (e.g., 'v1.0')"""
  version: String!

  """Preview image CID (optional)"""
  previewCid: String

  """Creation timestamp (Unix seconds)"""
  createdAt: BigInt!

  """Last update timestamp (Unix seconds)"""
  updatedAt: BigInt!

  """Total tips received in wei"""
  totalTips: BigInt!

  """Number of tips received"""
  tipCount: Int!

  """List of payments (tips and purchases) for this note"""
  payments: [Payment!]! @derivedFrom(field: "note")

  """Transaction hash of mint transaction"""
  mintTxHash: Bytes!

  """Block number when minted"""
  mintBlockNumber: BigInt!
}

type Payment @entity {
  """Unique identifier (txHash-logIndex)"""
  id: ID!

  """Related note"""
  note: Note!

  """Sender address"""
  from: Bytes!

  """Amount in wei"""
  amount: BigInt!

  """Payment type (TIP or BUY)"""
  type: PaymentType!

  """Transaction hash"""
  txHash: Bytes!

  """Block timestamp (Unix seconds)"""
  timestamp: BigInt!

  """Block number"""
  blockNumber: BigInt!
}

enum PaymentType {
  TIP
  BUY
}

type User @entity {
  """User address"""
  id: ID!

  """Notes created by this user"""
  notesCreated: [Note!]! @derivedFrom(field: "author")

  """Total notes created"""
  noteCount: Int!

  """Total tips sent"""
  tipsSent: BigInt!

  """Total tips received (as author)"""
  tipsReceived: BigInt!

  """Payments sent"""
  paymentsSent: [Payment!]! @derivedFrom(field: "from")

  """First activity timestamp"""
  firstActivityAt: BigInt!

  """Last activity timestamp"""
  lastActivityAt: BigInt!
}

type PlatformStats @entity {
  """Singleton ID ('platform')"""
  id: ID!

  """Total notes minted"""
  totalNotes: Int!

  """Total tips amount in wei"""
  totalTips: BigInt!

  """Total number of tip transactions"""
  totalPayments: Int!

  """Number of unique creators"""
  uniqueCreators: Int!

  """Number of unique tippers"""
  uniqueTippers: Int!

  """Last updated timestamp"""
  lastUpdatedAt: BigInt!
}

type DailyStat @entity {
  """Date in format 'YYYY-MM-DD'"""
  id: ID!

  """Date as Unix timestamp (start of day)"""
  date: BigInt!

  """Notes minted on this day"""
  notesMinted: Int!

  """Tips received on this day"""
  tipsAmount: BigInt!

  """Number of tip transactions"""
  tipsCount: Int!

  """Unique creators active on this day"""
  activeCreators: Int!

  """Unique tippers active on this day"""
  activeTippers: Int!
}
```

---

## 3. Event Handlers

### 3.1 subgraph.yaml

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  # NoteNFT Contract
  - kind: ethereum/contract
    name: NoteNFT
    network: base-sepolia
    source:
      address: "0x..." # Replace with deployed address
      abi: NoteNFT
      startBlock: 0 # Replace with deployment block
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Note
        - User
        - PlatformStats
        - DailyStat
      abis:
        - name: NoteNFT
          file: ./abis/NoteNFT.json
      eventHandlers:
        - event: NoteMinted(indexed uint256,indexed address,string,string,uint256)
          handler: handleNoteMinted
        - event: NoteMetadataUpdated(indexed uint256,string,string)
          handler: handleNoteMetadataUpdated
      file: ./src/note-nft.ts

  # RewardVault Contract
  - kind: ethereum/contract
    name: RewardVault
    network: base-sepolia
    source:
      address: "0x..." # Replace with deployed address
      abi: RewardVault
      startBlock: 0 # Replace with deployment block
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Note
        - Payment
        - User
        - PlatformStats
        - DailyStat
      abis:
        - name: RewardVault
          file: ./abis/RewardVault.json
      eventHandlers:
        - event: TipReceived(indexed uint256,indexed address,uint256,uint256)
          handler: handleTipReceived
      file: ./src/reward-vault.ts
```

---

## 4. Mapping Handlers

### 4.1 note-nft.ts

```typescript
// src/note-nft.ts
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  NoteMinted,
  NoteMetadataUpdated,
} from "../generated/NoteNFT/NoteNFT";
import { Note, User, PlatformStats, DailyStat } from "../generated/schema";

export function handleNoteMinted(event: NoteMinted): void {
  log.info("NoteMinted event: tokenId={}, author={}", [
    event.params.tokenId.toString(),
    event.params.author.toHexString(),
  ]);

  // Create Note entity
  let note = new Note(event.params.tokenId.toString());
  note.tokenId = event.params.tokenId;
  note.author = event.params.author;
  note.cid = event.params.cid;
  note.version = event.params.version;
  note.createdAt = event.params.timestamp;
  note.updatedAt = event.params.timestamp;
  note.totalTips = BigInt.fromI32(0);
  note.tipCount = 0;
  note.mintTxHash = event.transaction.hash;
  note.mintBlockNumber = event.block.number;

  // Extract courseId and previewCid from event data (if available)
  // Note: These may need to be parsed from event logs or transaction input
  // For now, set defaults and update via indexing service
  note.courseId = ""; // TODO: Parse from transaction input
  note.previewCid = null;

  note.save();

  // Update or create User
  let userId = event.params.author.toHexString();
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.noteCount = 0;
    user.tipsSent = BigInt.fromI32(0);
    user.tipsReceived = BigInt.fromI32(0);
    user.firstActivityAt = event.block.timestamp;
  }
  user.noteCount += 1;
  user.lastActivityAt = event.block.timestamp;
  user.save();

  // Update PlatformStats
  let stats = getPlatformStats();
  stats.totalNotes += 1;
  stats.uniqueCreators = stats.uniqueCreators; // Will be calculated separately
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();

  // Update DailyStat
  let dailyStat = getDailyStat(event.block.timestamp);
  dailyStat.notesMinted += 1;
  dailyStat.save();
}

export function handleNoteMetadataUpdated(event: NoteMetadataUpdated): void {
  log.info("NoteMetadataUpdated event: tokenId={}", [
    event.params.tokenId.toString(),
  ]);

  let note = Note.load(event.params.tokenId.toString());
  if (note == null) {
    log.error("Note not found: tokenId={}", [event.params.tokenId.toString()]);
    return;
  }

  note.cid = event.params.newCid;
  note.version = event.params.newVersion;
  note.updatedAt = event.block.timestamp;
  note.save();
}

// Helper: Get or create PlatformStats singleton
function getPlatformStats(): PlatformStats {
  let stats = PlatformStats.load("platform");
  if (stats == null) {
    stats = new PlatformStats("platform");
    stats.totalNotes = 0;
    stats.totalTips = BigInt.fromI32(0);
    stats.totalPayments = 0;
    stats.uniqueCreators = 0;
    stats.uniqueTippers = 0;
    stats.lastUpdatedAt = BigInt.fromI32(0);
  }
  return stats;
}

// Helper: Get or create DailyStat
function getDailyStat(timestamp: BigInt): DailyStat {
  // Calculate start of day (Unix timestamp)
  let dayStartTimestamp = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
  let dateStr = dayStartTimestamp.toString();

  let dailyStat = DailyStat.load(dateStr);
  if (dailyStat == null) {
    dailyStat = new DailyStat(dateStr);
    dailyStat.date = dayStartTimestamp;
    dailyStat.notesMinted = 0;
    dailyStat.tipsAmount = BigInt.fromI32(0);
    dailyStat.tipsCount = 0;
    dailyStat.activeCreators = 0;
    dailyStat.activeTippers = 0;
  }
  return dailyStat;
}
```

---

### 4.2 reward-vault.ts

```typescript
// src/reward-vault.ts
import { BigInt, log } from "@graphprotocol/graph-ts";
import { TipReceived } from "../generated/RewardVault/RewardVault";
import { Note, Payment, User, PlatformStats, DailyStat } from "../generated/schema";
import { PaymentType } from "../generated/schema";

export function handleTipReceived(event: TipReceived): void {
  log.info("TipReceived event: tokenId={}, from={}, amount={}", [
    event.params.tokenId.toString(),
    event.params.from.toHexString(),
    event.params.amount.toString(),
  ]);

  // Load Note
  let note = Note.load(event.params.tokenId.toString());
  if (note == null) {
    log.error("Note not found for tip: tokenId={}", [
      event.params.tokenId.toString(),
    ]);
    return;
  }

  // Create Payment entity
  let paymentId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let payment = new Payment(paymentId);
  payment.note = note.id;
  payment.from = event.params.from;
  payment.amount = event.params.amount;
  payment.type = PaymentType.TIP;
  payment.txHash = event.transaction.hash;
  payment.timestamp = event.params.timestamp;
  payment.blockNumber = event.block.number;
  payment.save();

  // Update Note
  note.totalTips = note.totalTips.plus(event.params.amount);
  note.tipCount += 1;
  note.save();

  // Update Tipper User
  let tipperId = event.params.from.toHexString();
  let tipper = User.load(tipperId);
  if (tipper == null) {
    tipper = new User(tipperId);
    tipper.noteCount = 0;
    tipper.tipsSent = BigInt.fromI32(0);
    tipper.tipsReceived = BigInt.fromI32(0);
    tipper.firstActivityAt = event.block.timestamp;
  }
  tipper.tipsSent = tipper.tipsSent.plus(event.params.amount);
  tipper.lastActivityAt = event.block.timestamp;
  tipper.save();

  // Update Author User
  let authorId = note.author.toHexString();
  let author = User.load(authorId);
  if (author != null) {
    // Calculate author's share (85% per default split)
    let authorShare = event.params.amount.times(BigInt.fromI32(85)).div(BigInt.fromI32(100));
    author.tipsReceived = author.tipsReceived.plus(authorShare);
    author.lastActivityAt = event.block.timestamp;
    author.save();
  }

  // Update PlatformStats
  let stats = PlatformStats.load("platform");
  if (stats == null) {
    stats = new PlatformStats("platform");
    stats.totalNotes = 0;
    stats.totalTips = BigInt.fromI32(0);
    stats.totalPayments = 0;
    stats.uniqueCreators = 0;
    stats.uniqueTippers = 0;
  }
  stats.totalTips = stats.totalTips.plus(event.params.amount);
  stats.totalPayments += 1;
  stats.lastUpdatedAt = event.block.timestamp;
  stats.save();

  // Update DailyStat
  let dayStartTimestamp = event.block.timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
  let dateStr = dayStartTimestamp.toString();
  let dailyStat = DailyStat.load(dateStr);
  if (dailyStat == null) {
    dailyStat = new DailyStat(dateStr);
    dailyStat.date = dayStartTimestamp;
    dailyStat.notesMinted = 0;
    dailyStat.tipsAmount = BigInt.fromI32(0);
    dailyStat.tipsCount = 0;
    dailyStat.activeCreators = 0;
    dailyStat.activeTippers = 0;
  }
  dailyStat.tipsAmount = dailyStat.tipsAmount.plus(event.params.amount);
  dailyStat.tipsCount += 1;
  dailyStat.save();
}
```

---

## 5. Common Queries

### 5.1 Get Note by ID

```graphql
query GetNote($id: ID!) {
  note(id: $id) {
    id
    tokenId
    author
    cid
    courseId
    version
    previewCid
    createdAt
    updatedAt
    totalTips
    tipCount
    payments(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      from
      amount
      type
      timestamp
      txHash
    }
  }
}
```

**Usage**: Note detail page

---

### 5.2 Get Top Tipped Notes

```graphql
query GetTopNotes($first: Int!, $skip: Int!) {
  notes(
    first: $first
    skip: $skip
    orderBy: totalTips
    orderDirection: desc
    where: { totalTips_gt: "0" }
  ) {
    id
    tokenId
    author
    cid
    courseId
    version
    previewCid
    totalTips
    tipCount
    createdAt
  }
}
```

**Usage**: Explore page (Top Tipped tab)

---

### 5.3 Get Newest Notes

```graphql
query GetNewestNotes($first: Int!, $skip: Int!) {
  notes(
    first: $first
    skip: $skip
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    tokenId
    author
    cid
    courseId
    version
    previewCid
    totalTips
    tipCount
    createdAt
  }
}
```

**Usage**: Explore page (Newest tab)

---

### 5.4 Get Notes by Author

```graphql
query GetNotesByAuthor($author: Bytes!, $first: Int!) {
  notes(
    first: $first
    orderBy: createdAt
    orderDirection: desc
    where: { author: $author }
  ) {
    id
    tokenId
    cid
    courseId
    version
    previewCid
    totalTips
    tipCount
    createdAt
  }
}
```

**Usage**: Profile page (My Notes)

---

### 5.5 Get User Stats

```graphql
query GetUserStats($id: ID!) {
  user(id: $id) {
    id
    noteCount
    tipsSent
    tipsReceived
    firstActivityAt
    lastActivityAt
    notesCreated(orderBy: createdAt, orderDirection: desc, first: 5) {
      id
      courseId
      totalTips
      createdAt
    }
  }
}
```

**Usage**: Profile page, leaderboards

---

### 5.6 Get Platform Stats

```graphql
query GetPlatformStats {
  platformStats(id: "platform") {
    id
    totalNotes
    totalTips
    totalPayments
    uniqueCreators
    uniqueTippers
    lastUpdatedAt
  }
}
```

**Usage**: Homepage, analytics dashboard

---

### 5.7 Get Daily Stats (Chart Data)

```graphql
query GetDailyStats($startDate: BigInt!, $endDate: BigInt!) {
  dailyStats(
    orderBy: date
    orderDirection: asc
    where: { date_gte: $startDate, date_lte: $endDate }
  ) {
    id
    date
    notesMinted
    tipsAmount
    tipsCount
    activeCreators
    activeTippers
  }
}
```

**Usage**: Analytics dashboard, charts

---

### 5.8 Search Notes by Course ID

```graphql
query SearchNotesByCourse($courseId: String!, $first: Int!) {
  notes(
    first: $first
    orderBy: createdAt
    orderDirection: desc
    where: { courseId_contains_nocase: $courseId }
  ) {
    id
    tokenId
    author
    courseId
    version
    totalTips
    createdAt
  }
}
```

**Usage**: Explore page filters

---

## 6. Deployment

### 6.1 Initialize Subgraph

```bash
# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Initialize subgraph
graph init --studio destudy-subgraph

# Install dependencies
cd destudy-subgraph
npm install
```

---

### 6.2 Configuration

Update `subgraph.yaml` with:
- Contract addresses (after deployment)
- Start blocks (deployment block numbers)
- Network name (`base-sepolia` or `polygon-amoy`)

---

### 6.3 Code Generation

```bash
# Generate types from schema and ABIs
graph codegen

# Build subgraph
graph build
```

---

### 6.4 Deploy to Hosted Service (Testnet)

```bash
# Authenticate
graph auth --studio <DEPLOY_KEY>

# Deploy
graph deploy --studio destudy-subgraph
```

---

### 6.5 Deploy to Decentralized Network (Production)

```bash
# Authenticate with The Graph Network
graph auth --product hosted-service <ACCESS_TOKEN>

# Deploy
graph deploy --product hosted-service <SUBGRAPH_NAME>
```

---

## 7. Monitoring & Debugging

### 7.1 Health Check

```graphql
query {
  _meta {
    block {
      number
      hash
      timestamp
    }
    deployment
    hasIndexingErrors
  }
}
```

---

### 7.2 Indexing Status

Check at: `https://thegraph.com/hosted-service/subgraph/<USERNAME>/destudy-subgraph`

**Key Metrics**:
- Current block
- Synced: Yes/No
- Failed: Yes/No
- Entities count

---

### 7.3 Common Issues

**Issue**: Subgraph not syncing
- **Solution**: Check start block, verify contract address, check event signatures

**Issue**: Entity not found errors
- **Solution**: Add null checks in handlers, verify entity IDs

**Issue**: Slow indexing
- **Solution**: Optimize mappings, reduce entity complexity, batch operations

---

## 8. Testing

### 8.1 Matchstick (Unit Tests)

```bash
# Install Matchstick
npm install --save-dev matchstick-as

# Run tests
graph test
```

**Example Test**:
```typescript
// tests/note-nft.test.ts
import { describe, test, assert, clearStore, beforeAll, afterAll } from "matchstick-as";
import { BigInt, Address } from "@graphprotocol/graph-ts";
import { handleNoteMinted } from "../src/note-nft";
import { createNoteMintedEvent } from "./utils";

describe("handleNoteMinted", () => {
  beforeAll(() => {
    // Setup
  });

  afterAll(() => {
    clearStore();
  });

  test("should create Note entity", () => {
    let tokenId = BigInt.fromI32(1);
    let author = Address.fromString("0x0000000000000000000000000000000000000001");
    let event = createNoteMintedEvent(tokenId, author, "QmTest", "v1.0", BigInt.fromI32(1699999999));

    handleNoteMinted(event);

    assert.entityCount("Note", 1);
    assert.fieldEquals("Note", "1", "author", author.toHexString());
    assert.fieldEquals("Note", "1", "cid", "QmTest");
  });
});
```

---

### 8.2 Integration Testing

Test against testnet:
1. Deploy contracts to testnet
2. Deploy subgraph
3. Execute transactions (mint, tip)
4. Query subgraph
5. Verify data accuracy

---

## 9. Performance Optimization

### 9.1 Entity Design

- Use derived fields (`@derivedFrom`) instead of arrays
- Minimize entity size (avoid large strings)
- Index frequently queried fields

### 9.2 Query Optimization

- Use pagination (`first`, `skip`)
- Filter at query level (`where`)
- Avoid deep nesting
- Cache results on frontend

### 9.3 Mapping Optimization

- Minimize storage reads/writes
- Batch updates when possible
- Use `BigInt` arithmetic carefully (gas-like costs)
- Add null checks to prevent errors

---

## 10. Security Considerations

### 10.1 Event Validation

- Verify token existence before updates
- Validate addresses (not zero)
- Check for duplicate event processing

### 10.2 Data Integrity

- Use transaction hash + log index for unique Payment IDs
- Atomic updates (all or nothing)
- Consistent timestamp sources

### 10.3 Access Control

- Subgraph is read-only (no access control needed)
- Sensitive data should not be indexed
- Consider privacy implications of public data

---

## 11. Future Enhancements

### 11.1 Additional Entities

- `Course` entity for course metadata
- `Collaborator` entity for revenue splits
- `Tag` entity for note categorization

### 11.2 Advanced Queries

- Full-text search (requires external service)
- Aggregation functions (sum, avg, count)
- Time-series analysis

### 11.3 Real-time Updates

- GraphQL subscriptions for live data
- Websocket connections

---

## 12. Resources

- The Graph Docs: https://thegraph.com/docs
- AssemblyScript: https://www.assemblyscript.org
- Matchstick Testing: https://github.com/LimeChain/matchstick
- Subgraph Studio: https://thegraph.com/studio
