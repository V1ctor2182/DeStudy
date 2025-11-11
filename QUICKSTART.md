# DeStudy Quick Start Guide

## Starting the Development Environment

To start both the Hardhat blockchain and the Next.js frontend:

```bash
./start_all.sh
```

This will:
1. Start the Hardhat local blockchain on port 8545
2. Deploy the smart contracts (NoteNFT and RewardVault)
3. Start the Next.js frontend on port 3001

**Services:**
- Hardhat Node: `http://127.0.0.1:8545`
- Frontend: `http://localhost:3001`

**Logs:**
- Hardhat: `logs/hardhat.log`
- Frontend: `logs/frontend.log`

## Stopping the Development Environment

To stop all services:

```bash
./stop_all.sh
```

This will cleanly shut down both the Hardhat node and the frontend server.

## Manual Commands

If you prefer to run services manually:

### Start Hardhat Node
```bash
cd contracts
npx hardhat node --port 8545
```

### Deploy Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## MetaMask Setup

1. **Add Network:**
   - Network Name: Localhost 8545
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. **Import Test Account:**
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has 10,000 test ETH

## Contract Addresses

After deployment, contracts are located at:
- **NoteNFT:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **RewardVault:** `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## Features

- **Upload Notes**: Upload files and mint them as NFTs
- **Explore Notes**: Browse all minted notes
- **Tip Notes**: Send tips to note authors
  - 85% goes to the author
  - 10% to contributors pool
  - 5% to treasury
- **Delete Notes**: Authors can delete their own notes
- **Withdraw Earnings**: Authors can withdraw accumulated tips

## Troubleshooting

### Hardhat node won't start
- Check if port 8545 is already in use: `lsof -i :8545`
- Kill existing process: `kill -9 $(lsof -ti:8545)`

### Frontend won't start
- Check if port 3001 is already in use: `lsof -i :3001`
- Kill existing process: `kill -9 $(lsof -ti:3001)`

### MetaMask shows 0 ETH
- Make sure you're on the "Localhost 8545" network in MetaMask
- The website URL (localhost:3001) is different from the blockchain network

### Transaction fails
- Restart the Hardhat node: `./stop_all.sh && ./start_all.sh`
- This gives you a fresh blockchain with reset account balances

## Development Workflow

1. Start services: `./start_all.sh`
2. Connect MetaMask to Localhost 8545
3. Visit `http://localhost:3001`
4. Upload and mint notes
5. Test tipping and deletion features
6. Stop services when done: `./stop_all.sh`

## Testing

Run contract tests:
```bash
cd contracts
npx hardhat test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## Production Deployment

For production deployment:
1. Update IPFS implementation (currently using mock)
2. Deploy contracts to a testnet or mainnet
3. Update contract addresses in `frontend/lib/contracts/addresses.ts`
4. Configure environment variables
5. Build frontend: `cd frontend && npm run build`

---

**Happy coding! 🚀**
