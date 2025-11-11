# DeStudy MVP Project Timeline

**Sprint Duration**: 14 days (2 weeks)
**Start Date**: TBD
**Target Demo Date**: Day 14
**Status**: Planning

---

## Overview

This timeline breaks down the 2-week MVP sprint into daily tasks with clear deliverables, dependencies, and acceptance criteria.

**Core Principle**: Build vertically (full stack slices) rather than horizontally to deliver a working demo as early as possible.

---

## Sprint Goals

1. **G1**: Demoable Upload → Mint → Tip flow by Day 10
2. **G2**: Complete on-chain flow with wallet integration
3. **G3**: Working Explore page with Newest/Top-tipped sorting
4. **G4**: Subgraph indexes events and frontend renders live data
5. **G5**: Security baseline (reentrancy, access control, testing)

---

## Team Composition (Assumed)

- **1 Full-stack Developer** (or split roles)
- **1 PM/Tech Lead** (Victor)

*Note: Timeline assumes 1 developer. Adjust if more resources available.*

---

## Daily Breakdown

---

### **Day 1-2: Foundation & Infrastructure**

**Focus**: Project setup, wallet connection, IPFS pipeline

#### Day 1 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **1.1** Setup monorepo structure (contracts, frontend, subgraph) | Dev | 2h | ⬜ |
| **1.2** Initialize Hardhat project with TypeScript | Dev | 1h | ⬜ |
| **1.3** Initialize Next.js 14 (App Router) with TypeScript & Tailwind | Dev | 1h | ⬜ |
| **1.4** Setup environment variables (.env templates) | Dev | 0.5h | ⬜ |
| **1.5** Configure ESLint, Prettier, Husky (code quality) | Dev | 1h | ⬜ |
| **1.6** Create basic Layout component (Header, Footer) | Dev | 1.5h | ⬜ |
| **1.7** Implement ConnectButton with MetaMask support | Dev | 2h | ⬜ |

**Deliverables**:
- ✓ Monorepo with all workspaces
- ✓ Next.js app running on localhost:3000
- ✓ Wallet connection functional

**Acceptance Criteria**:
- [ ] `npm run dev` starts frontend
- [ ] MetaMask connects and displays address
- [ ] Header shows connected wallet state

---

#### Day 2 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **2.1** Setup Web3.storage or Pinata account & API key | Dev | 0.5h | ⬜ |
| **2.2** Implement useIPFS hook (upload with progress) | Dev | 2h | ⬜ |
| **2.3** Create FileUploader component | Dev | 2h | ⬜ |
| **2.4** Add file validation (type, size) | Dev | 1h | ⬜ |
| **2.5** Test IPFS upload with sample PDF | Dev | 1h | ⬜ |
| **2.6** Create /upload page with FileUploader | Dev | 1.5h | ⬜ |

**Deliverables**:
- ✓ Working IPFS upload from frontend
- ✓ Upload page with file picker and progress bar

**Acceptance Criteria**:
- [ ] Upload PDF → returns CID
- [ ] Progress bar updates during upload
- [ ] Error handling (file too large, wrong type)

---

### **Day 3-5: Smart Contracts & Deployment**

**Focus**: NoteNFT, RewardVault contracts, tests, deployment

#### Day 3 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **3.1** Implement NoteNFT contract (mint, metadata, ERC-721) | Dev | 3h | ⬜ |
| **3.2** Write NoteNFT unit tests (minting, metadata) | Dev | 2h | ⬜ |
| **3.3** Implement NoteNFT event emissions | Dev | 1h | ⬜ |
| **3.4** Test edge cases (invalid inputs, max lengths) | Dev | 1.5h | ⬜ |
| **3.5** Run Slither static analysis | Dev | 0.5h | ⬜ |

**Deliverables**:
- ✓ NoteNFT contract complete
- ✓ Unit tests passing (100% coverage)

**Acceptance Criteria**:
- [ ] All NoteNFT tests pass
- [ ] No critical Slither warnings
- [ ] Gas benchmarks within targets

---

#### Day 4 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **4.1** Implement RewardVault contract (tip, withdraw, splits) | Dev | 3h | ⬜ |
| **4.2** Write RewardVault unit tests (tipping, withdrawals) | Dev | 2h | ⬜ |
| **4.3** Test split calculations (author/treasury) | Dev | 1h | ⬜ |
| **4.4** Test reentrancy protection | Dev | 1h | ⬜ |
| **4.5** Integration test: NoteNFT + RewardVault | Dev | 1h | ⬜ |

**Deliverables**:
- ✓ RewardVault contract complete
- ✓ Integration tests passing

**Acceptance Criteria**:
- [ ] All RewardVault tests pass
- [ ] Pull payment pattern works
- [ ] Split ratios accurate

---

#### Day 5 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **5.1** Write deployment scripts (Hardhat) | Dev | 1.5h | ⬜ |
| **5.2** Deploy contracts to local Hardhat network | Dev | 0.5h | ⬜ |
| **5.3** Setup Base Sepolia testnet (faucet, RPC) | Dev | 1h | ⬜ |
| **5.4** Deploy contracts to Base Sepolia | Dev | 1h | ⬜ |
| **5.5** Verify contracts on BaseScan | Dev | 1h | ⬜ |
| **5.6** Document contract addresses | Dev | 0.5h | ⬜ |
| **5.7** Export ABIs for frontend | Dev | 0.5h | ⬜ |

**Deliverables**:
- ✓ Contracts deployed to Base Sepolia
- ✓ Verified on BaseScan
- ✓ ABIs exported

**Acceptance Criteria**:
- [ ] Contracts visible on BaseScan
- [ ] Deployment addresses documented
- [ ] ABIs copied to frontend

---

### **Day 6-7: Subgraph Indexing**

**Focus**: The Graph subgraph for event indexing

#### Day 6 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **6.1** Initialize subgraph project | Dev | 1h | ⬜ |
| **6.2** Define GraphQL schema (Note, Payment entities) | Dev | 1.5h | ⬜ |
| **6.3** Copy contract ABIs to subgraph | Dev | 0.5h | ⬜ |
| **6.4** Configure subgraph.yaml (contracts, events) | Dev | 1h | ⬜ |
| **6.5** Implement handleNoteMinted mapping | Dev | 2h | ⬜ |
| **6.6** Implement handleTipReceived mapping | Dev | 2h | ⬜ |

**Deliverables**:
- ✓ Subgraph schema defined
- ✓ Event handlers implemented

**Acceptance Criteria**:
- [ ] Schema matches contract events
- [ ] Mappings compile without errors

---

#### Day 7 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **7.1** Write Matchstick unit tests for mappings | Dev | 2h | ⬜ |
| **7.2** Test entity creation and relationships | Dev | 1.5h | ⬜ |
| **7.3** Build subgraph | Dev | 0.5h | ⬜ |
| **7.4** Deploy subgraph to The Graph Studio | Dev | 1h | ⬜ |
| **7.5** Verify indexing (trigger test transactions) | Dev | 1.5h | ⬜ |
| **7.6** Test queries in GraphQL Playground | Dev | 1.5h | ⬜ |

**Deliverables**:
- ✓ Subgraph deployed and syncing
- ✓ Test queries working

**Acceptance Criteria**:
- [ ] Subgraph syncs to latest block
- [ ] Queries return correct data
- [ ] No indexing errors

---

### **Day 8-10: Frontend Integration (Core Flow)**

**Focus**: Mint, Detail, Explore pages with subgraph data

#### Day 8 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **8.1** Setup wagmi config (Base Sepolia) | Dev | 1h | ⬜ |
| **8.2** Create useNoteContract hook (mintNote) | Dev | 2h | ⬜ |
| **8.3** Create MintForm component | Dev | 2h | ⬜ |
| **8.4** Integrate FileUploader + MintForm on /upload page | Dev | 1.5h | ⬜ |
| **8.5** Add transaction status UI (pending, success, error) | Dev | 1.5h | ⬜ |
| **8.6** Test full upload → mint flow | Dev | 1h | ⬜ |

**Deliverables**:
- ✓ Upload → Mint flow complete
- ✓ Transaction feedback

**Acceptance Criteria**:
- [ ] Upload PDF → get CID
- [ ] Fill form → mint NFT
- [ ] Transaction confirms on-chain
- [ ] User redirected to note detail

---

#### Day 9 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **9.1** Create useSubgraph hook (GraphQL queries) | Dev | 1.5h | ⬜ |
| **9.2** Implement NoteDetailPage (/note/[id]) | Dev | 2h | ⬜ |
| **9.3** Display note metadata (author, CID, version) | Dev | 1h | ⬜ |
| **9.4** Add IPFS preview (iframe or link) | Dev | 1.5h | ⬜ |
| **9.5** Create useRewardVault hook (tip) | Dev | 1.5h | ⬜ |
| **9.6** Implement TipButton component | Dev | 2h | ⬜ |

**Deliverables**:
- ✓ Note detail page functional
- ✓ Tipping works

**Acceptance Criteria**:
- [ ] Note detail shows correct info
- [ ] IPFS content previews
- [ ] Tip button sends transaction
- [ ] Subgraph updates after tip

---

#### Day 10 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **10.1** Create NoteCard component | Dev | 1.5h | ⬜ |
| **10.2** Implement ExplorePage (/explore) | Dev | 2h | ⬜ |
| **10.3** Add SortToggle (Newest / Top Tipped) | Dev | 1.5h | ⬜ |
| **10.4** Add FilterBar (course ID filter) | Dev | 1h | ⬜ |
| **10.5** Implement pagination (load more) | Dev | 1.5h | ⬜ |
| **10.6** Test explore page with multiple notes | Dev | 1h | ⬜ |
| **10.7** Demo Day 1-10 deliverables | PM | 1h | ⬜ |

**Deliverables**:
- ✓ Explore page complete
- ✓ **Milestone: Full Upload → Mint → Tip → Explore flow working**

**Acceptance Criteria**:
- [ ] Explore shows notes from subgraph
- [ ] Sorting works (Newest/Top)
- [ ] Filtering works
- [ ] Clicking note navigates to detail

**🎯 MILESTONE DEMO**: Complete Upload → Mint → Tip → Explore flow

---

### **Day 11-12: Testing, Optimization, Error Handling**

**Focus**: E2E tests, error states, mobile optimization

#### Day 11 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **11.1** Setup Playwright for E2E tests | Dev | 1h | ⬜ |
| **11.2** Write E2E test: Upload → Mint flow | Dev | 2h | ⬜ |
| **11.3** Write E2E test: Explore → Tip flow | Dev | 2h | ⬜ |
| **11.4** Add error states (upload fail, tx reject) | Dev | 1.5h | ⬜ |
| **11.5** Add loading states (skeletons) | Dev | 1.5h | ⬜ |
| **11.6** Implement retry logic for IPFS | Dev | 1h | ⬜ |

**Deliverables**:
- ✓ E2E tests for critical flows
- ✓ Error handling complete

**Acceptance Criteria**:
- [ ] E2E tests pass
- [ ] Error messages are helpful
- [ ] Loading states show correctly

---

#### Day 12 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **12.1** Mobile responsive review (all pages) | Dev | 2h | ⬜ |
| **12.2** Fix mobile layout issues | Dev | 1.5h | ⬜ |
| **12.3** Test on iOS Safari and Android Chrome | Dev | 1h | ⬜ |
| **12.4** Optimize images (Next.js Image) | Dev | 1h | ⬜ |
| **12.5** Add meta tags (SEO, OG) | Dev | 1h | ⬜ |
| **12.6** Run Lighthouse audit (target >90) | Dev | 1h | ⬜ |
| **12.7** Fix performance issues | Dev | 1.5h | ⬜ |

**Deliverables**:
- ✓ Mobile optimized
- ✓ Performance targets met

**Acceptance Criteria**:
- [ ] App works on mobile browsers
- [ ] Lighthouse score > 90
- [ ] No console errors

---

### **Day 13-14: Polish, Documentation, Demo Prep**

**Focus**: Bug fixes, telemetry, documentation, demo

#### Day 13 Tasks

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **13.1** Implement telemetry (client events) | Dev | 2h | ⬜ |
| **13.2** Add API route /api/telemetry | Dev | 1h | ⬜ |
| **13.3** Test telemetry events fire correctly | Dev | 0.5h | ⬜ |
| **13.4** Create HomePage (landing/hero) | Dev | 2h | ⬜ |
| **13.5** Create ProfilePage (my notes, balance) | Dev | 2h | ⬜ |
| **13.6** Add "Withdraw" functionality | Dev | 1.5h | ⬜ |
| **13.7** Bug triage and priority fixes | Dev | 2h | ⬜ |

**Deliverables**:
- ✓ Telemetry logging
- ✓ Profile page functional
- ✓ Critical bugs fixed

**Acceptance Criteria**:
- [ ] Events logged to console/service
- [ ] Profile shows user's notes
- [ ] Withdraw works

---

#### Day 14 Tasks (Demo Day)

| Task | Owner | Time | Status |
|------|-------|------|--------|
| **14.1** Final bug fixes (high priority only) | Dev | 2h | ⬜ |
| **14.2** Update README with setup instructions | Dev | 1h | ⬜ |
| **14.3** Record demo video (5 min) | PM | 1h | ⬜ |
| **14.4** Prepare demo script (live walkthrough) | PM | 1h | ⬜ |
| **14.5** Deploy frontend to Vercel (production) | Dev | 1h | ⬜ |
| **14.6** Test production deployment | Dev | 1h | ⬜ |
| **14.7** Demo presentation | PM + Dev | 1h | ⬜ |
| **14.8** Sprint retrospective | Team | 1h | ⬜ |

**Deliverables**:
- ✓ **MVP deployed to production**
- ✓ **Demo video recorded**
- ✓ **Live demo presented**

**Acceptance Criteria**:
- [ ] Production app accessible at destudy.xyz (or similar)
- [ ] Demo covers all core features
- [ ] Retrospective notes documented

**🎉 SPRINT COMPLETE!**

---

## Demo Script (Day 14)

### Demo Flow (5-10 minutes)

1. **Introduction** (1 min)
   - Problem: Notes are scattered, no incentives
   - Solution: DeStudy - upload, mint, tip

2. **Wallet Connection** (30 sec)
   - Show MetaMask connection
   - Display address

3. **Upload & Mint** (2 min)
   - Navigate to /upload
   - Select sample PDF
   - Upload to IPFS (show progress)
   - Fill mint form (course ID, version)
   - Mint NFT (MetaMask confirmation)
   - Show transaction on BaseScan

4. **Explore Notes** (1 min)
   - Navigate to /explore
   - Show Newest notes
   - Switch to Top Tipped
   - Click on a note

5. **Note Detail & Tip** (2 min)
   - Show note metadata
   - Preview IPFS content
   - Send a tip (0.001 ETH)
   - Show transaction confirmation

6. **Subgraph Update** (1 min)
   - Refresh /explore
   - Show updated tip amount
   - Show note climbed Top Tipped list

7. **Profile & Withdraw** (1 min)
   - Navigate to /profile
   - Show pending balance
   - Withdraw funds
   - Show transaction

8. **Q&A** (2 min)

---

## Risk Mitigation

### High-Risk Items

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **IPFS upload slow/fails** | Medium | High | Multiple gateways, retry logic, fallback provider |
| **Subgraph indexing lag** | Medium | Medium | Local optimistic UI, polling, clear sync status |
| **Contract bugs found late** | Low | Critical | 100% test coverage, Slither analysis, early deployment |
| **E2E tests flaky** | Medium | Low | Isolate test data, retry logic, mock MetaMask |
| **Developer illness** | Low | High | Clear documentation, daily commits, pair programming |

### Contingency Plan

If behind schedule by Day 10:
1. **Cut scope**: Remove Profile page (focus on core flow)
2. **Reduce polish**: Skip HomePage, use basic landing
3. **Defer tests**: Prioritize manual testing over E2E
4. **Extend 2-3 days**: Negotiate demo date extension

---

## Success Metrics (Post-Sprint)

### Technical Metrics

- [ ] Smart contract test coverage: 100%
- [ ] Frontend test coverage: >80%
- [ ] E2E tests: 3+ critical flows covered
- [ ] Lighthouse score: >90
- [ ] Zero critical security issues (Slither)

### Demo Metrics

- [ ] Complete Upload → Mint → Tip flow in <3 minutes
- [ ] Subgraph updates within 30 seconds of transaction
- [ ] No errors during demo
- [ ] Mobile responsive demo works

---

## Post-MVP Roadmap

### Week 3-4: Polish & Expand

- [ ] AccessMarket contract (paid unlock)
- [ ] Collaborator revenue splits
- [ ] Search & filter enhancements
- [ ] User reputation system
- [ ] Analytics dashboard

### Week 5-6: Production Ready

- [ ] External security audit
- [ ] Mainnet deployment
- [ ] Marketing website
- [ ] User onboarding flow
- [ ] Documentation site

### Week 7-8: Growth

- [ ] Mobile app (React Native)
- [ ] DAO governance
- [ ] Token launch (if applicable)
- [ ] Partnerships (universities, platforms)

---

## Daily Standup Template

**Format**: 15 minutes, async in Slack or sync call

**Questions**:
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers?

**Example**:
```
Day 5 Standup
✅ Completed: NoteNFT contract, unit tests (100% coverage)
🚧 Today: Deploy contracts to Base Sepolia, verify on BaseScan
🚫 Blockers: None
```

---

## Sprint Ceremonies

### Kickoff (Day 0)
- Review PRD and technical docs
- Confirm scope and timeline
- Assign tasks

### Mid-Sprint Review (Day 7)
- Demo progress (contracts + subgraph)
- Adjust timeline if needed
- Celebrate wins

### Final Demo (Day 14)
- Live walkthrough
- Record video
- Collect feedback

### Retrospective (Day 14)
- What went well?
- What could improve?
- Action items for next sprint

---

## Task Management

**Tool**: GitHub Projects, Jira, or Linear

**Board Columns**:
- **Backlog**: All tasks
- **Ready**: Prioritized for sprint
- **In Progress**: Currently working
- **Review**: PR open, needs review
- **Done**: Merged and deployed

**Labels**:
- `contracts`, `frontend`, `subgraph`
- `bug`, `feature`, `docs`, `test`
- `high-priority`, `medium-priority`, `low-priority`
- `blocked`

---

## Communication Plan

### Daily
- Standup updates in Slack
- Commit messages follow convention
- Push code at EOD (end of day)

### Weekly
- Mid-sprint review (Day 7)
- Update stakeholders on progress

### As Needed
- Pair programming for complex tasks
- Code reviews within 4 hours
- Unblock teammates immediately

---

## Definition of Done (Checklist)

A task is "done" when:
- [ ] Code written and self-reviewed
- [ ] Tests written and passing
- [ ] Linting and formatting pass
- [ ] PR created and reviewed
- [ ] Merged to main
- [ ] Deployed (if applicable)
- [ ] Documented (if public API)

---

## Appendix: Dependencies Graph

```
Day 1-2 (Setup)
    ├─→ Day 3-5 (Contracts)
    │       ├─→ Day 6-7 (Subgraph)
    │       └─→ Day 8-10 (Frontend)
    └─→ Day 8-10 (Frontend)
            └─→ Day 11-12 (Testing & Optimization)
                    └─→ Day 13-14 (Polish & Demo)
```

**Critical Path**: Day 1-2 → Day 3-5 → Day 6-7 → Day 8-10 → Day 11-12 → Day 13-14

---

**Timeline Version**: 0.1
**Last Updated**: 2025-11-10
**Next Review**: Kickoff (Day 0)

---

**Ready to build? Let's ship this! 🚀**
