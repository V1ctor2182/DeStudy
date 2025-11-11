# DeStudy

**Turn high-quality study notes into verifiable, traceable, and incentivized digital assets.**

Upload to IPFS → Mint as NFT → Earn tips from learners.

---

## 🎯 Project Status

- **Phase**: Pre-Development
- **Version**: 0.1 (MVP Planning)
- **Timeline**: 2-week sprint (14 days)
- **Target Demo**: Day 14

---

## 📋 Quick Links

### Core Documents

| Document | Description | Status |
|----------|-------------|--------|
| [META.md](./META.md) | Product Requirements Document (PRD) | ✅ Complete |
| [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) | Developer onboarding guide | ✅ Complete |
| [Project Timeline](./docs/PROJECT_TIMELINE.md) | Detailed 14-day sprint plan | ✅ Complete |

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

## 🚀 Getting Started

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

## 🏗️ Architecture Overview

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

## 🎨 Key Features (MVP)

### For Creators
- ✅ Upload notes (PDF/Markdown) to IPFS
- ✅ Mint as ERC-721 NFT with metadata
- ✅ Version control and authorship proof
- ✅ Earn tips from learners
- ✅ Non-custodial withdrawals

### For Learners
- ✅ Browse notes (Newest/Top-tipped)
- ✅ Preview content on IPFS
- ✅ One-click tipping
- ✅ Filter by course/topic

### For Platform
- ✅ Decentralized storage (no server costs)
- ✅ On-chain revenue tracking
- ✅ Automatic fee split (author/treasury)
- ✅ No traditional database needed

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

## 🏃 Quick Start (Developer)

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

## 🗓️ Sprint Timeline (14 Days)

| Days | Focus | Deliverables |
|------|-------|--------------|
| **1-2** | Setup & IPFS | Monorepo, wallet connection, IPFS upload |
| **3-5** | Smart Contracts | NoteNFT, RewardVault, tests, deployment |
| **6-7** | Subgraph | Schema, mappings, indexing |
| **8-10** | Frontend Core | Mint, Detail, Explore pages |
| **11-12** | Testing & Polish | E2E tests, mobile, optimization |
| **13-14** | Demo Prep | Bug fixes, telemetry, demo |

**🎯 Day 10 Milestone**: Complete Upload → Mint → Tip → Explore flow
**🎉 Day 14**: MVP Demo & Deploy

**Detailed breakdown**: [PROJECT_TIMELINE.md](./docs/PROJECT_TIMELINE.md)

---

## 🎬 Demo Flow (Day 14)

1. **Connect wallet** (MetaMask)
2. **Upload note** (PDF) → IPFS
3. **Mint NFT** with course ID & version
4. **Browse notes** on Explore page
5. **View note detail** with IPFS preview
6. **Send tip** to author
7. **See update** in real-time (subgraph)

**Total time**: 5 minutes
**Watch demo video**: TBD (after Day 14)

---

## 🔐 Security

### MVP Security Measures

- ✅ Reentrancy protection (OpenZeppelin)
- ✅ Pull payment pattern (no direct transfers)
- ✅ Input validation (file types, sizes, lengths)
- ✅ Access control (Ownable, author-only updates)
- ✅ Event logging (full transparency)
- ✅ 100% contract test coverage
- ✅ Slither static analysis

### Post-MVP (Before Mainnet)

- [ ] External smart contract audit
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Multi-sig treasury
- [ ] Emergency pause mechanism

**Details**: [Technical Architecture §4](./docs/architecture/TECHNICAL_ARCHITECTURE.md#4-security-architecture)

---

## 📊 Success Metrics

### North Star Metric

**Weekly Active Tipped Notes (WA-Tipped)**: Number of unique notes that received tips in a week.

### Core KPIs (MVP)

| Metric | Target |
|--------|--------|
| **D1 Activation** | ≥30% of wallets mint a note |
| **Tip Incidence** | ≥15% of notes receive a tip |
| **Median Tip** | ≥0.01 ETH |
| **W1 Retention** | ≥20% return within 7 days |

**Full KPI list**: [META.md §10](./META.md#10-telemetry--kpis)

---

## 🤝 Contributing

### For Team Members

1. Read [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
2. Pick a task from [PROJECT_TIMELINE.md](./docs/PROJECT_TIMELINE.md)
3. Create feature branch: `git checkout -b feature/your-feature`
4. Follow commit convention: `feat: add note minting`
5. Open PR with description and tests

### Code Quality Standards

- **Contracts**: 100% test coverage, no Slither warnings
- **Frontend**: ESLint passing, TypeScript strict mode
- **Tests**: All tests pass before merge
- **Reviews**: 1 approval required for merge

---

## 📞 Support & Resources

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

### Community

- **Discord**: TBD
- **GitHub Issues**: [Issues](https://github.com/your-org/DeStudy/issues)
- **GitHub Discussions**: [Discussions](https://github.com/your-org/DeStudy/discussions)

---

## 📜 License

**TBD** (MIT, Apache 2.0, or other)

---

## 🙏 Acknowledgments

Built with:
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [The Graph Protocol](https://thegraph.com/)
- [IPFS](https://ipfs.tech/)
- [Next.js](https://nextjs.org/)
- [wagmi](https://wagmi.sh/)

---

## 📅 Changelog

### v0.1 - 2025-11-10 (Planning Phase)

- ✅ Product Requirements Document (PRD)
- ✅ Technical Architecture
- ✅ Smart Contract Specifications
- ✅ Frontend Component Specifications
- ✅ Subgraph Schema
- ✅ API Specifications
- ✅ Testing Strategy
- ✅ Development Setup Guide
- ✅ Project Timeline (14-day sprint)

**Next**: Day 1 - Kickoff & Project Setup

---

## 🚀 Let's Build!

Ready to turn study notes into valuable on-chain assets?

1. **Read**: [META.md](./META.md) (15 min)
2. **Setup**: [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md) (45 min)
3. **Start**: [Day 1 Tasks](./docs/PROJECT_TIMELINE.md#day-1-tasks)

**Questions?** Open a [GitHub Discussion](https://github.com/your-org/DeStudy/discussions)

---

**Built with ❤️ by the DeStudy team**

---

*Last updated: 2025-11-10*
