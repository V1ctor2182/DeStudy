# Testing Strategy v0.1

**Date**: 2025-11-10
**Status**: Draft
**Coverage Target**: Contracts 100%, Frontend 80%, E2E Critical Paths

---

## 1. Overview

This document outlines the comprehensive testing strategy for DeStudy, covering unit tests, integration tests, E2E tests, and manual testing procedures.

---

## 2. Testing Pyramid

```
               /\
              /  \
             / E2E \          5-10 tests (critical user flows)
            /______\
           /        \
          / Integration \     20-30 tests (component + contract interaction)
         /______________\
        /                \
       /   Unit Tests     \  100+ tests (contracts, hooks, utilities)
      /____________________\
```

---

## 3. Smart Contract Testing

### 3.1 Testing Framework

**Tools**:
- Hardhat
- Chai (assertions)
- Ethers.js
- Hardhat Network (local blockchain)
- Hardhat Coverage

**Coverage Target**: 100% (all branches)

---

### 3.2 NoteNFT Tests

```typescript
// test/NoteNFT.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { NoteNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NoteNFT", function () {
  let noteNFT: NoteNFT;
  let owner: SignerWithAddress;
  let author: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, author, user] = await ethers.getSigners();

    const NoteNFTFactory = await ethers.getContractFactory("NoteNFT");
    noteNFT = await NoteNFTFactory.deploy("DeStudy Note", "DNOTE", "ipfs://");
    await noteNFT.deployed();
  });

  describe("Minting", function () {
    it("should mint a note with valid parameters", async function () {
      const tx = await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest123",
        "IKNS-5300",
        "v1.0",
        ""
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "NoteMinted");

      expect(event).to.not.be.undefined;
      expect(event!.args!.tokenId).to.equal(0);
      expect(event!.args!.author).to.equal(author.address);
      expect(event!.args!.cid).to.equal("QmTest123");
    });

    it("should increment tokenId for each mint", async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest1",
        "IKNS-5300",
        "v1.0",
        ""
      );
      const tx = await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest2",
        "IKNS-5301",
        "v1.0",
        ""
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === "NoteMinted");

      expect(event!.args!.tokenId).to.equal(1);
    });

    it("should revert when minting to zero address", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          ethers.constants.AddressZero,
          "QmTest",
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: mint to zero address");
    });

    it("should revert with empty CID", async function () {
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          "",
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid CID");
    });

    it("should revert with CID exceeding max length", async function () {
      const longCID = "Q".repeat(101);
      await expect(
        noteNFT.connect(author).mintNote(
          author.address,
          longCID,
          "IKNS-5300",
          "v1.0",
          ""
        )
      ).to.be.revertedWith("NoteNFT: invalid CID");
    });

    it("should store correct metadata", async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        "QmPreview"
      );

      const metadata = await noteNFT.getNoteMetadata(0);

      expect(metadata.author).to.equal(author.address);
      expect(metadata.cid).to.equal("QmTest");
      expect(metadata.courseId).to.equal("IKNS-5300");
      expect(metadata.version).to.equal("v1.0");
      expect(metadata.previewCid).to.equal("QmPreview");
    });
  });

  describe("Metadata Updates", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should allow author to update metadata", async function () {
      await expect(
        noteNFT.connect(author).updateNoteMetadata(0, "QmTest2", "v2.0")
      )
        .to.emit(noteNFT, "NoteMetadataUpdated")
        .withArgs(0, "QmTest2", "v2.0");

      const metadata = await noteNFT.getNoteMetadata(0);
      expect(metadata.cid).to.equal("QmTest2");
      expect(metadata.version).to.equal("v2.0");
    });

    it("should revert if non-author tries to update", async function () {
      await expect(
        noteNFT.connect(user).updateNoteMetadata(0, "QmTest2", "v2.0")
      ).to.be.revertedWith("NoteNFT: not the author");
    });

    it("should revert if token does not exist", async function () {
      await expect(
        noteNFT.connect(author).updateNoteMetadata(999, "QmTest2", "v2.0")
      ).to.be.revertedWith("NoteNFT: token does not exist");
    });
  });

  describe("Queries", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should return correct author", async function () {
      expect(await noteNFT.authorOf(0)).to.equal(author.address);
    });

    it("should return correct total supply", async function () {
      expect(await noteNFT.totalSupply()).to.equal(1);

      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest2",
        "IKNS-5301",
        "v1.0",
        ""
      );

      expect(await noteNFT.totalSupply()).to.equal(2);
    });

    it("should revert authorOf for non-existent token", async function () {
      await expect(noteNFT.authorOf(999)).to.be.revertedWith(
        "NoteNFT: token does not exist"
      );
    });
  });

  describe("ERC-721 Compatibility", function () {
    beforeEach(async function () {
      await noteNFT.connect(author).mintNote(
        author.address,
        "QmTest",
        "IKNS-5300",
        "v1.0",
        ""
      );
    });

    it("should support ERC-721 interface", async function () {
      // ERC-721 interface ID: 0x80ac58cd
      expect(await noteNFT.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("should allow token transfer", async function () {
      await noteNFT.connect(author).transferFrom(author.address, user.address, 0);
      expect(await noteNFT.ownerOf(0)).to.equal(user.address);
    });

    it("should preserve metadata after transfer", async function () {
      await noteNFT.connect(author).transferFrom(author.address, user.address, 0);
      const metadata = await noteNFT.getNoteMetadata(0);
      expect(metadata.author).to.equal(author.address); // Original author unchanged
    });
  });
});
```

---

### 3.3 RewardVault Tests

```typescript
// test/RewardVault.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { NoteNFT, RewardVault } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("RewardVault", function () {
  let noteNFT: NoteNFT;
  let rewardVault: RewardVault;
  let owner: SignerWithAddress;
  let author: SignerWithAddress;
  let tipper: SignerWithAddress;
  let treasury: SignerWithAddress;

  beforeEach(async function () {
    [owner, author, tipper, treasury] = await ethers.getSigners();

    // Deploy NoteNFT
    const NoteNFTFactory = await ethers.getContractFactory("NoteNFT");
    noteNFT = await NoteNFTFactory.deploy("DeStudy Note", "DNOTE", "ipfs://");
    await noteNFT.deployed();

    // Deploy RewardVault
    const RewardVaultFactory = await ethers.getContractFactory("RewardVault");
    rewardVault = await RewardVaultFactory.deploy(
      noteNFT.address,
      treasury.address,
      {
        authorBps: 8500, // 85%
        contributorsBps: 1000, // 10%
        treasuryBps: 500, // 5%
      }
    );
    await rewardVault.deployed();

    // Mint a note
    await noteNFT.connect(author).mintNote(
      author.address,
      "QmTest",
      "IKNS-5300",
      "v1.0",
      ""
    );
  });

  describe("Tipping", function () {
    it("should accept tips and split correctly", async function () {
      const tipAmount = ethers.utils.parseEther("1.0");

      await expect(
        rewardVault.connect(tipper).tip(0, { value: tipAmount })
      )
        .to.emit(rewardVault, "TipReceived")
        .withArgs(0, tipper.address, tipAmount, await ethers.provider.getBlock("latest").then(b => b.timestamp));

      // Check balances (85% author, 15% treasury for MVP)
      const authorPending = await rewardVault.pending(author.address);
      const treasuryPending = await rewardVault.pending(treasury.address);

      expect(authorPending).to.equal(ethers.utils.parseEther("0.85"));
      expect(treasuryPending).to.equal(ethers.utils.parseEther("0.15")); // 10% + 5%
    });

    it("should revert tip below minimum", async function () {
      const smallTip = ethers.utils.parseEther("0.0001");

      await expect(
        rewardVault.connect(tipper).tip(0, { value: smallTip })
      ).to.be.revertedWith("RewardVault: tip too small");
    });

    it("should revert tip to non-existent token", async function () {
      await expect(
        rewardVault.connect(tipper).tip(999, { value: ethers.utils.parseEther("0.01") })
      ).to.be.revertedWith("RewardVault: token does not exist");
    });

    it("should accumulate multiple tips", async function () {
      await rewardVault.connect(tipper).tip(0, { value: ethers.utils.parseEther("0.1") });
      await rewardVault.connect(tipper).tip(0, { value: ethers.utils.parseEther("0.2") });

      const totalTips = await rewardVault.totalTips(0);
      expect(totalTips).to.equal(ethers.utils.parseEther("0.3"));
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Tip to create pending balance
      await rewardVault.connect(tipper).tip(0, {
        value: ethers.utils.parseEther("1.0"),
      });
    });

    it("should allow author to withdraw", async function () {
      const pendingBefore = await rewardVault.pending(author.address);
      const balanceBefore = await author.getBalance();

      const tx = await rewardVault.connect(author).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const balanceAfter = await author.getBalance();
      const pendingAfter = await rewardVault.pending(author.address);

      expect(pendingAfter).to.equal(0);
      expect(balanceAfter.add(gasUsed).sub(balanceBefore)).to.equal(pendingBefore);
    });

    it("should revert withdraw with no balance", async function () {
      await expect(
        rewardVault.connect(tipper).withdraw()
      ).to.be.revertedWith("RewardVault: no pending balance");
    });

    it("should emit Withdrawn event", async function () {
      const pending = await rewardVault.pending(author.address);

      await expect(rewardVault.connect(author).withdraw())
        .to.emit(rewardVault, "Withdrawn")
        .withArgs(author.address, pending);
    });
  });

  describe("Configuration", function () {
    it("should allow owner to update split config", async function () {
      await expect(
        rewardVault.connect(owner).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 500,
        })
      )
        .to.emit(rewardVault, "SplitConfigUpdated")
        .withArgs(9000, 500, 500);
    });

    it("should revert invalid split config (not 100%)", async function () {
      await expect(
        rewardVault.connect(owner).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 1000, // Total = 10500 (> 100%)
        })
      ).to.be.revertedWith("RewardVault: invalid split config");
    });

    it("should revert if non-owner tries to update config", async function () {
      await expect(
        rewardVault.connect(author).updateSplitConfig({
          authorBps: 9000,
          contributorsBps: 500,
          treasuryBps: 500,
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Reentrancy Protection", function () {
    // Test with malicious contract attempting reentrancy
    // This requires a separate malicious contract deployment
    // Skipped for brevity but critical for audit
  });
});
```

---

### 3.4 Gas Benchmarks

```typescript
// test/GasBenchmark.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Gas Benchmarks", function () {
  it("mintNote should cost < 150k gas", async function () {
    // ... setup
    const tx = await noteNFT.mintNote(/* ... */);
    const receipt = await tx.wait();

    console.log(`mintNote gas used: ${receipt.gasUsed.toString()}`);
    expect(receipt.gasUsed.toNumber()).to.be.lessThan(150000);
  });

  it("tip should cost < 100k gas", async function () {
    // ... setup
    const tx = await rewardVault.tip(0, { value: ethers.utils.parseEther("0.01") });
    const receipt = await tx.wait();

    console.log(`tip gas used: ${receipt.gasUsed.toString()}`);
    expect(receipt.gasUsed.toNumber()).to.be.lessThan(100000);
  });
});
```

---

### 3.5 Coverage Report

```bash
# Run coverage
npx hardhat coverage

# Expected output:
# File                | % Stmts | % Branch | % Funcs | % Lines |
# --------------------|---------|----------|---------|---------|
# contracts/NoteNFT.sol|   100   |   100    |   100   |   100   |
# contracts/RewardVault.sol|   100   |   100    |   100   |   100   |
# --------------------|---------|----------|---------|---------|
# All files           |   100   |   100    |   100   |   100   |
```

---

## 4. Frontend Testing

### 4.1 Testing Framework

**Tools**:
- Jest
- React Testing Library
- MSW (Mock Service Worker) for API mocking
- wagmi test utilities

**Coverage Target**: 80%

---

### 4.2 Component Tests

```typescript
// __tests__/components/wallet/ConnectButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { WagmiConfig } from 'wagmi';
import { mockWagmiClient } from '../../mocks/wagmi';

describe('ConnectButton', () => {
  it('should render "Connect Wallet" when not connected', () => {
    render(
      <WagmiConfig client={mockWagmiClient({ isConnected: false })}>
        <ConnectButton />
      </WagmiConfig>
    );

    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });

  it('should render address when connected', () => {
    render(
      <WagmiConfig
        client={mockWagmiClient({
          isConnected: true,
          address: '0x1234567890123456789012345678901234567890',
        })}
      >
        <ConnectButton />
      </WagmiConfig>
    );

    expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
  });

  it('should show wallet options on click', () => {
    render(
      <WagmiConfig client={mockWagmiClient({ isConnected: false })}>
        <ConnectButton />
      </WagmiConfig>
    );

    fireEvent.click(screen.getByText('Connect Wallet'));

    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('WalletConnect')).toBeInTheDocument();
  });
});
```

---

### 4.3 Hook Tests

```typescript
// __tests__/hooks/useNoteContract.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useNoteContract } from '@/hooks/useNoteContract';
import { WagmiConfig } from 'wagmi';
import { mockWagmiClient } from '../mocks/wagmi';

describe('useNoteContract', () => {
  it('should mint note successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WagmiConfig client={mockWagmiClient()}>{children}</WagmiConfig>
    );

    const { result } = renderHook(() => useNoteContract(), { wrapper });

    const tokenId = await result.current.mintNote({
      cid: 'QmTest',
      courseId: 'IKNS-5300',
      version: 'v1.0',
      previewCid: '',
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tokenId).toBeDefined();
  });
});
```

---

### 4.4 Integration Tests (Component + Hook + Contract)

```typescript
// __tests__/integration/UploadFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadPage } from '@/app/upload/page';
import { setupMockIPFS, setupMockContract } from '../mocks';

describe('Upload Flow Integration', () => {
  beforeEach(() => {
    setupMockIPFS();
    setupMockContract();
  });

  it('should complete upload → mint flow', async () => {
    render(<UploadPage />);

    // Select file
    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Upload to IPFS
    const uploadButton = screen.getByText(/upload to ipfs/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });

    // Fill mint form
    const courseIdInput = screen.getByLabelText(/course id/i);
    fireEvent.change(courseIdInput, { target: { value: 'IKNS-5300' } });

    // Mint NFT
    const mintButton = screen.getByText(/mint note nft/i);
    fireEvent.click(mintButton);

    await waitFor(() => {
      expect(screen.getByText(/mint successful/i)).toBeInTheDocument();
    });
  });
});
```

---

## 5. End-to-End Testing

### 5.1 Testing Framework

**Tool**: Playwright

**Environments**:
- Local (Hardhat Network)
- Testnet (Base Sepolia)

---

### 5.2 Critical User Flows

#### **Flow 1: Upload → Mint → View**

```typescript
// e2e/upload-mint-view.spec.ts
import { test, expect } from '@playwright/test';

test('should upload, mint, and view note', async ({ page }) => {
  // Connect wallet
  await page.goto('http://localhost:3000');
  await page.click('text=Connect Wallet');
  await page.click('text=MetaMask');
  // Handle MetaMask popup (requires metamask extension)

  // Upload note
  await page.goto('http://localhost:3000/upload');
  await page.setInputFiles('input[type="file"]', './test-fixtures/sample.pdf');
  await page.click('text=Upload to IPFS');

  // Wait for upload
  await page.waitForSelector('text=Upload complete', { timeout: 15000 });

  // Fill mint form
  await page.fill('input[name="courseId"]', 'TEST-101');
  await page.fill('input[name="version"]', 'v1.0');
  await page.click('text=Mint Note NFT');

  // Approve transaction (MetaMask)
  // ...

  // Wait for mint confirmation
  await page.waitForSelector('text=Mint successful', { timeout: 30000 });

  // Navigate to note detail
  await page.click('text=View Note');

  // Verify note details
  await expect(page.locator('text=TEST-101')).toBeVisible();
  await expect(page.locator('text=v1.0')).toBeVisible();
});
```

---

#### **Flow 2: Explore → View → Tip**

```typescript
// e2e/explore-tip.spec.ts
import { test, expect } from '@playwright/test';

test('should explore notes and tip', async ({ page }) => {
  await page.goto('http://localhost:3000/explore');

  // Switch to Top Tipped
  await page.click('text=Top Tipped');

  // Click first note
  await page.click('.note-card >> nth=0');

  // Verify note detail page
  await expect(page).toHaveURL(/\/note\/\d+/);

  // Send tip
  await page.click('button:has-text("0.001 ETH")');
  await page.click('text=Send Tip');

  // Approve transaction
  // ...

  // Wait for confirmation
  await page.waitForSelector('text=Tip sent successfully', { timeout: 30000 });
});
```

---

### 5.3 E2E Test Coverage

| Flow | Priority | Status |
|------|----------|--------|
| Wallet connect/disconnect | High | Required |
| Upload → Mint → View | High | Required |
| Explore (Newest/Top) | High | Required |
| View Note → Tip | High | Required |
| Profile → Withdraw | Medium | Optional |
| Update Metadata | Medium | Optional |
| Error handling (failed tx) | Medium | Optional |
| Mobile responsive | Low | Optional |

---

## 6. Subgraph Testing

### 6.1 Unit Tests (Matchstick)

```typescript
// tests/note-nft.test.ts
import { describe, test, assert } from "matchstick-as";
import { handleNoteMinted } from "../src/note-nft";
import { createNoteMintedEvent } from "./utils";

describe("handleNoteMinted", () => {
  test("should create Note entity", () => {
    const event = createNoteMintedEvent(/* ... */);
    handleNoteMinted(event);

    assert.entityCount("Note", 1);
    assert.fieldEquals("Note", "0", "cid", "QmTest");
  });
});
```

---

### 6.2 Integration Tests

Test against deployed contracts on testnet:
1. Deploy contracts
2. Deploy subgraph
3. Execute transactions
4. Query subgraph
5. Verify data accuracy and sync speed

---

## 7. Manual Testing

### 7.1 Smoke Testing Checklist

Run before each release:

- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] File upload (various formats, sizes)
- [ ] Mint note
- [ ] View note detail
- [ ] Send tip
- [ ] Withdraw balance
- [ ] Explore page (Newest, Top Tipped)
- [ ] Mobile responsiveness
- [ ] Error states (no wallet, tx rejected)
- [ ] Loading states
- [ ] IPFS gateway fallbacks

---

### 7.2 Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

### 7.3 Wallet Compatibility

Test with:
- MetaMask (browser extension)
- WalletConnect (mobile)
- Coinbase Wallet
- Rainbow Wallet

---

## 8. Performance Testing

### 8.1 Frontend Performance

**Tool**: Lighthouse, WebPageTest

**Targets**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Lighthouse Score > 90

---

### 8.2 Load Testing

**Tool**: k6, Artillery

**Scenarios**:
- 100 concurrent users browsing explore page
- 50 concurrent uploads
- 100 concurrent subgraph queries

**Targets**:
- API response time p95 < 1s
- Subgraph query time p95 < 500ms
- Error rate < 1%

---

## 9. Security Testing

### 9.1 Smart Contract Audits

**Automated Tools**:
- Slither (static analysis)
- Mythril (symbolic execution)
- Echidna (fuzzing)

```bash
# Run Slither
slither contracts/

# Run Mythril
myth analyze contracts/NoteNFT.sol

# Run Echidna (requires echidna.yaml config)
echidna-test contracts/NoteNFT.sol
```

**Manual Review Checklist**:
- [ ] Reentrancy vulnerabilities
- [ ] Integer overflow/underflow
- [ ] Access control
- [ ] Front-running risks
- [ ] Gas optimization
- [ ] Event emissions

**External Audit** (if budget allows): OpenZeppelin, Trail of Bits, Consensys Diligence

---

### 9.2 Frontend Security

**Tools**:
- npm audit
- Snyk
- OWASP ZAP

**Checklist**:
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection
- [ ] API key security (env vars)
- [ ] Dependency vulnerabilities
- [ ] CSP headers
- [ ] HTTPS only

---

## 10. Regression Testing

### 10.1 Regression Test Suite

Maintain a suite of automated tests that run on every commit:

**Smart Contracts**:
- All unit tests (100% coverage)
- Integration tests (key flows)
- Gas benchmarks

**Frontend**:
- Component tests (critical components)
- Hook tests
- Integration tests

**E2E**:
- Critical user flows (3-5 tests)

---

### 10.2 CI Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run contract tests
        run: npx hardhat test
      - name: Run coverage
        run: npx hardhat coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run frontend tests
        run: npm test
      - name: Run lint
        run: npm run lint

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Install Playwright
        run: npx playwright install
      - name: Run E2E tests
        run: npx playwright test
```

---

## 11. Test Data Management

### 11.1 Test Fixtures

```
test-fixtures/
├── sample.pdf              # Valid PDF (1MB)
├── large.pdf               # Large PDF (49MB, edge case)
├── invalid.exe             # Invalid file type
├── sample.md               # Valid Markdown
└── sample.png              # Valid image
```

---

### 11.2 Mock Data

```typescript
// mocks/notes.ts
export const mockNotes = [
  {
    id: '0',
    author: '0x1234...',
    cid: 'QmTest1',
    courseId: 'IKNS-5300',
    version: 'v1.0',
    totalTips: BigInt(1000000000000000000), // 1 ETH
    createdAt: BigInt(1699999999),
  },
  // ...
];
```

---

## 12. Test Environment Setup

### 12.1 Local Development

```bash
# Terminal 1: Start Hardhat network
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start subgraph (optional)
docker-compose up graph-node

# Terminal 4: Start frontend
npm run dev
```

---

### 12.2 Testnet

- Network: Base Sepolia
- Faucets: [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- Explorer: [BaseScan Sepolia](https://sepolia.basescan.org/)

---

## 13. Acceptance Criteria

### 13.1 Definition of Done (Testing)

A feature is complete when:
- [ ] Unit tests written and passing (coverage targets met)
- [ ] Integration tests cover critical interactions
- [ ] E2E tests cover user flows (if applicable)
- [ ] Manual smoke test passed
- [ ] No critical bugs or regressions
- [ ] Code review approved
- [ ] Documentation updated

---

### 13.2 Release Checklist

Before deploying to production:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Coverage targets met (contracts 100%, frontend 80%)
- [ ] Security audit completed (or scheduled)
- [ ] Performance benchmarks met
- [ ] Browser compatibility verified
- [ ] Wallet compatibility verified
- [ ] Smoke tests passed
- [ ] Staging deployment tested
- [ ] Rollback plan documented

---

## 14. Continuous Improvement

### 14.1 Test Metrics

Track over time:
- Test coverage (contracts, frontend)
- Test execution time
- Flaky test rate
- Bug escape rate (bugs found in production vs QA)

### 14.2 Retrospectives

After each sprint:
- Review test effectiveness
- Identify gaps in coverage
- Update test strategy as needed

---

**Document Version**: 0.1
**Last Updated**: 2025-11-10
**Next Review**: After testing implementation (D12)
