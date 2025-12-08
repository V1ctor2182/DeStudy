# DeStudy

**Turn high-quality study notes into verifiable, traceable, and incentivized digital assets.**

Upload to IPFS → Mint as NFT → Earn tips from learners.

---

## Quick Links

### Core Documents

| Document | Description | Status |
|----------|-------------|--------|
| [META.md](./META.md) | Product Requirements Document (PRD) | Complete |
| [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) | Developer onboarding guide | Complete |
| [Project Timeline](./docs/PROJECT_TIMELINE.md) | Detailed 14-day sprint plan | Complete |

### Technical Specifications

| Document | Description |
|----------|-------------|
| [Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md) | System design and component architecture |
| [Smart Contract Specs](./docs/contracts/CONTRACT_SPECS.md) | NoteNFT, RewardVault contract details |
| [Frontend Component Specs](./docs/frontend/COMPONENT_SPECS.md) | React/Next.js component guide |
| [Subgraph Specs](./docs/api/SUBGRAPH_SPECS.md) | The Graph indexing schema |
| [API Specs](./docs/api/API_SPECS.md) | Backend API routes |
| [Testing Strategy](./docs/testing/TESTING_STRATEGY.md) | Comprehensive testing approach |

---

## Getting Started

### For Developers

1. **Read the PRD**: Start with [META.md](./META.md) to understand the product vision
2. **Setup Environment**: Follow [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
3. **Review Timeline**: Check [PROJECT_TIMELINE.md](./docs/PROJECT_TIMELINE.md) for sprint tasks
4. **Pick a Task**: Start with Day 1-2 tasks (project setup)

### For Stakeholders

- **Product Overview**: See [META.md §1-3](./META.md#1-product-summary-one-liner--background)
- **Feature List**: See [META.md §4](./META.md#4-scope)
- **Timeline**: See [PROJECT_TIMELINE.md](./docs/PROJECT_TIMELINE.md)
- **Demo Script**: See [Timeline §Demo Script](./docs/PROJECT_TIMELINE.md#demo-script-day-14)

---

## Architecture Overview

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
└─────────────────┘  └──────────────┘  └────────────┘
        │
┌───────▼─────────────────────────────────┐
│   Blockchain (Base Sepolia / Polygon)   │
└─────────────────────────────────────────┘
```

**Learn more**: [Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md)

---

## Key Features (MVP)

### For Creators
- Upload notes (PDF/Markdown) to IPFS
- Mint as ERC-721 NFT with metadata
- Version control and authorship proof
- Earn tips from learners
- Non-custodial withdrawals

### For Learners
- Browse notes (Newest/Top-tipped)
- Preview content on IPFS
- One-click tipping
- Filter by course/topic

### For Platform
- Decentralized storage (no server costs)
- On-chain revenue tracking
- Automatic fee split (author/treasury)
- No traditional database needed

**Full feature list**: [META.md §4](./META.md#4-scope)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Smart Contracts** | Solidity 0.8.20, Hardhat, OpenZeppelin |
| **Blockchain** | Base Sepolia (testnet) → Base (mainnet) |
| **Storage** | IPFS (Web3.storage or Pinata) |
| **Indexing** | The Graph (Hosted Service → Decentralized) |
| **Wallet** | wagmi v2, viem, MetaMask, WalletConnect |
| **Testing** | Jest, React Testing Library, Playwright, Hardhat |
| **Deployment** | Vercel (frontend), Hardhat (contracts) |

**Detailed breakdown**: [Technical Architecture §8](./docs/architecture/TECHNICAL_ARCHITECTURE.md#8-tech-stack--dependencies)

---

## 📖 Documentation Structure

```
DeStudy/
├── META.md                           # Product Requirements Document (PRD)
├── README.md                         # This file
├── DEVELOPMENT_SETUP.md              # Developer onboarding
├── docs/
│   ├── architecture/
│   │   └── TECHNICAL_ARCHITECTURE.md # System design
│   ├── contracts/
│   │   └── CONTRACT_SPECS.md        # Smart contract specs
│   ├── frontend/
│   │   └── COMPONENT_SPECS.md       # Component library
│   ├── api/
│   │   ├── SUBGRAPH_SPECS.md        # The Graph schema
│   │   └── API_SPECS.md             # Backend API routes
│   ├── testing/
│   │   └── TESTING_STRATEGY.md      # Testing approach
│   └── PROJECT_TIMELINE.md          # 14-day sprint plan
├── contracts/                        # Smart contracts (TBD)
├── frontend/                         # Next.js app (TBD)
└── subgraph/                         # The Graph subgraph (TBD)
```

---

## Quick Start (Developer)

### Prerequisites

- Node.js v18+
- MetaMask browser extension
- Web3.storage or Pinata account (free)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/DeStudy.git
cd DeStudy

# Follow the detailed setup guide
open DEVELOPMENT_SETUP.md
```

**Full instructions**: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)

---

## Security

### MVP Security Measures

- Reentrancy protection (OpenZeppelin)
- Pull payment pattern (no direct transfers)
- Input validation (file types, sizes, lengths)
- Access control (Ownable, author-only updates)
- Event logging (full transparency)
- 100% contract test coverage
- Slither static analysis

**Details**: [Technical Architecture §4](./docs/architecture/TECHNICAL_ARCHITECTURE.md#4-security-architecture)

## Resources

### Documentation

- **PRD**: [META.md](./META.md)
- **Setup Guide**: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
- **Timeline**: [PROJECT_TIMELINE.md](./docs/PROJECT_TIMELINE.md)
- **Architecture**: [docs/architecture/](./docs/architecture/)

### External Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [The Graph Docs](https://thegraph.com/docs)
- [OpenZeppelin](https://docs.openzeppelin.com/contracts)
- [wagmi](https://wagmi.sh/)

---

## Acknowledgments

Built with:
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [The Graph Protocol](https://thegraph.com/)
- [IPFS](https://ipfs.tech/)
- [Next.js](https://nextjs.org/)
- [wagmi](https://wagmi.sh/)

**Built with ❤️ by the DeStudy team**
