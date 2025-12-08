# DeStudy Development Setup Guide

**Estimated Setup Time**: 30-60 minutes

---

## 1. Prerequisites

### 1.1 Required Software

Install the following before starting:

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | v18+ | [Download](https://nodejs.org/) or use `nvm` |
| **npm** or **pnpm** | Latest | Comes with Node.js |
| **Git** | Latest | [Download](https://git-scm.com/) |
| **MetaMask** | Latest | [Chrome Extension](https://metamask.io/) |
| **Docker** | Latest (optional) | [Download](https://www.docker.com/) |

### 1.2 Accounts & API Keys

Create accounts and obtain API keys for:

1. **IPFS Storage** (choose one):
   - [Web3.Storage](https://web3.storage/) (Free 5GB)
   - [Pinata](https://pinata.cloud/) (Free 1GB)

2. **The Graph** (for subgraph):
   - [The Graph Studio](https://thegraph.com/studio/)

3. **RPC Provider** (optional, or use public):
   - [Alchemy](https://www.alchemy.com/)
   - [Infura](https://infura.io/)

4. **Block Explorer**:
   - [BaseScan](https://basescan.org/register) (for contract verification)

5. **WalletConnect** (for mobile wallets):
   - [WalletConnect Cloud](https://cloud.walletconnect.com/)

---

## 2. Project Structure

```
DeStudy/
├── contracts/                # Smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── NoteNFT.sol
│   │   └── RewardVault.sol
│   ├── test/
│   ├── scripts/
│   ├── hardhat.config.ts
│   └── package.json
├── frontend/                 # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── next.config.js
│   └── package.json
├── subgraph/                 # The Graph subgraph
│   ├── src/
│   ├── abis/
│   ├── schema.graphql
│   ├── subgraph.yaml
│   └── package.json
├── docs/                     # Documentation
└── README.md
```

---

## 3. Initial Setup

### 3.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/DeStudy.git
cd DeStudy

# Create feature branch
git checkout -b feature/initial-setup
```

### 3.2 Environment Variables

Create `.env` files for each workspace:

#### **contracts/.env**

```bash
# Network RPC URLs
ALCHEMY_API_KEY=your_alchemy_api_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key_for_testnet_deployments
TREASURY_ADDRESS=0x...

# Block Explorer (for verification)
BASESCAN_API_KEY=your_basescan_api_key

# Coinmarketcap (for gas reporting, optional)
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

⚠️ **Security**: Never commit private keys to Git. Use a testnet wallet with minimal funds.

#### **frontend/.env.local**

```bash
# Public (exposed to browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/...

# IPFS (client-side, use read-only or rate-limited key)
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Private (server-side only)
WEB3_STORAGE_TOKEN=your_web3_storage_token_server_side

# Analytics (optional)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
SENTRY_DSN=your_sentry_dsn
```

#### **subgraph/.env**

```bash
# The Graph Studio
GRAPH_DEPLOY_KEY=your_deploy_key
SUBGRAPH_NAME=destudy-subgraph
```

---

## 4. Smart Contracts Setup

### 4.1 Install Dependencies

```bash
cd contracts
npm install
```

### 4.2 Compile Contracts

```bash
npx hardhat compile
```

Expected output:
```
Compiled 10 Solidity files successfully
```

### 4.3 Run Tests

```bash
# Run all tests
npx hardhat test

# Run with gas reporter
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

Expected output:
```
  NoteNFT
    ✓ should mint a note with valid parameters
    ✓ should increment tokenId
    ... (all tests pass)

  RewardVault
    ✓ should accept tips and split correctly
    ... (all tests pass)

Coverage: 100%
```

### 4.4 Deploy Locally

```bash
# Terminal 1: Start local Hardhat network
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

Save the contract addresses output:
```
NoteNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
RewardVault deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 4.5 Deploy to Testnet

```bash
# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

# Verify contracts
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 5. Frontend Setup

### 5.1 Install Dependencies

```bash
cd frontend
npm install
```

### 5.2 Update Contract Addresses

Create `lib/contracts/addresses.ts`:

```typescript
export const NOTE_NFT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const REWARD_VAULT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
```

### 5.3 Add Contract ABIs

Copy ABIs from compiled contracts:

```bash
# Copy ABIs from contracts to frontend
cp ../contracts/artifacts/contracts/NoteNFT.sol/NoteNFT.json ./lib/contracts/abis/
cp ../contracts/artifacts/contracts/RewardVault.sol/RewardVault.json ./lib/contracts/abis/
```

### 5.4 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5.5 Connect MetaMask to Local Network

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Add Hardhat Network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

4. Import test account from Hardhat:
   - Copy private key from `npx hardhat node` output
   - MetaMask → Import Account → Paste private key

---

## 6. Subgraph Setup

### 6.1 Install Dependencies

```bash
cd subgraph
npm install

# Install Graph CLI globally
npm install -g @graphprotocol/graph-cli
```

### 6.2 Initialize Subgraph

```bash
# Create subgraph in The Graph Studio
graph init --studio destudy-subgraph

# Or use existing configuration
# (already set up in subgraph.yaml)
```

### 6.3 Update Configuration

Edit `subgraph.yaml`:

```yaml
dataSources:
  - kind: ethereum/contract
    name: NoteNFT
    network: base-sepolia
    source:
      address: "0x..." # Your deployed NoteNFT address
      abi: NoteNFT
      startBlock: 12345678 # Your deployment block number
```

### 6.4 Copy Contract ABIs

```bash
# Copy ABIs from contracts
cp ../contracts/artifacts/contracts/NoteNFT.sol/NoteNFT.json ./abis/
cp ../contracts/artifacts/contracts/RewardVault.sol/RewardVault.json ./abis/
```

### 6.5 Generate Code & Build

```bash
# Generate types from schema and ABIs
graph codegen

# Build subgraph
graph build
```

### 6.6 Deploy Subgraph

```bash
# Authenticate with The Graph Studio
graph auth --studio <DEPLOY_KEY>

# Deploy to Studio
graph deploy --studio destudy-subgraph
```

### 6.7 Local Subgraph (Optional)

For local development with a full graph-node:

```bash
# Start graph-node, IPFS, and PostgreSQL
cd subgraph
docker-compose up -d

# Create local subgraph
graph create --node http://localhost:8020/ destudy-subgraph

# Deploy locally
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 destudy-subgraph
```

---

## 7. IPFS Setup

### 7.1 Web3.Storage (Recommended for MVP)

1. Sign up at [web3.storage](https://web3.storage/)
2. Create API token
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token
   ```

### 7.2 Test Upload

```bash
cd frontend
node -e "
const { Web3Storage } = require('web3.storage');
const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN });
console.log('IPFS client ready:', !!client);
"
```

---

## 8. Development Workflow

### 8.1 Daily Development

```bash
# Terminal 1: Contracts (if making changes)
cd contracts
npx hardhat node

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Subgraph (if local)
cd subgraph
docker-compose up
```

### 8.2 Making Changes

1. **Smart Contracts**:
   ```bash
   # Edit contract
   vim contracts/NoteNFT.sol

   # Test
   npx hardhat test

   # Redeploy locally
   npx hardhat run scripts/deploy.js --network localhost

   # Update frontend addresses
   # Update subgraph.yaml
   ```

2. **Frontend**:
   ```bash
   # Edit component
   vim frontend/components/...

   # Run tests
   npm test

   # Lint
   npm run lint
   ```

3. **Subgraph**:
   ```bash
   # Edit schema or mappings
   vim subgraph/schema.graphql

   # Codegen
   graph codegen

   # Build
   graph build

   # Deploy
   graph deploy --studio destudy-subgraph
   ```

---

## 9. Testing

### 9.1 Run All Tests

```bash
# Contracts
cd contracts && npx hardhat test

# Frontend
cd frontend && npm test

# E2E
cd frontend && npx playwright test
```

### 9.2 Coverage

```bash
# Contracts
cd contracts && npx hardhat coverage

# Frontend
cd frontend && npm run test:coverage
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### **Issue**: MetaMask transaction fails with "nonce too high"
**Solution**: Reset account in MetaMask (Settings → Advanced → Reset Account)

#### **Issue**: Subgraph not syncing
**Solution**:
- Verify contract address and start block in `subgraph.yaml`
- Check event signatures match contract
- View logs in The Graph Studio

#### **Issue**: IPFS upload fails
**Solution**:
- Check API token is valid
- Verify file size < 50MB
- Try different gateway/provider

#### **Issue**: Frontend can't connect to wallet
**Solution**:
- Ensure MetaMask is installed and unlocked
- Check network ID matches (31337 for local, 84532 for Base Sepolia)
- Clear browser cache

#### **Issue**: "Module not found" errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 10.2 Debugging Tips

**Contracts**:
```bash
# Use console.log in contracts
import "hardhat/console.sol";
console.log("Value:", value);

# Run with detailed stack traces
npx hardhat test --verbose
```

**Frontend**:
```bash
# Enable debug logs
NEXT_PUBLIC_DEBUG=true npm run dev

# Check browser console for errors
# Check Network tab for failed requests
```

**Subgraph**:
```bash
# Check logs in The Graph Studio
# Add logging in mappings:
import { log } from "@graphprotocol/graph-ts";
log.info("Processing event: {}", [event.params.tokenId.toString()]);
```

---

## 11. Code Quality Tools

### 11.1 Linting

```bash
# Contracts
cd contracts
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

### 11.2 Formatting

```bash
# Contracts (Prettier)
cd contracts
npx prettier --write "contracts/**/*.sol"

# Frontend (Prettier)
cd frontend
npx prettier --write "**/*.{ts,tsx,js,jsx,json,css,md}"
```

### 11.3 Type Checking

```bash
# Contracts (compile)
cd contracts
npx hardhat compile

# Frontend (TypeScript)
cd frontend
npm run type-check
```

### 11.4 Pre-commit Hooks

Install Husky for pre-commit checks:

```bash
# Root of monorepo
npm install --save-dev husky lint-staged

# Setup husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Create `.lintstagedrc.json`:
```json
{
  "contracts/**/*.sol": [
    "prettier --write",
    "solhint"
  ],
  "frontend/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

---

## 12. IDE Setup

### 12.1 VS Code (Recommended)

Install extensions:
- **Solidity** (Juan Blanco)
- **ESLint**
- **Prettier**
- **Tailwind CSS IntelliSense**
- **GraphQL** (GraphQL Foundation)
- **Error Lens**

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[solidity]": {
    "editor.defaultFormatter": "JuanBlanco.solidity"
  },
  "solidity.compileUsingRemoteVersion": "v0.8.20",
  "solidity.formatter": "prettier"
}
```

### 12.2 WebStorm / IntelliJ IDEA

1. Install Solidity plugin
2. Enable ESLint and Prettier
3. Configure file watchers for auto-formatting

---

## 13. Collaboration

### 13.1 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add note tipping functionality"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### 13.2 Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc
refactor: code restructuring
test: add or update tests
chore: maintenance tasks
```

---

## 14. Resources

### 14.1 Documentation

- [Hardhat Docs](https://hardhat.org/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh/)
- [The Graph Docs](https://thegraph.com/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 14.2 Learning Resources

- [Solidity by Example](https://solidity-by-example.org/)
- [Ethereum Development Documentation](https://ethereum.org/en/developers/docs/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

---

## 15. Others

**Setup Complete!**

If you encounter any issues, please:
1. Check the [Troubleshooting](#10-troubleshooting) section
2. Search [GitHub Issues](https://github.com/your-org/DeStudy/issues)
