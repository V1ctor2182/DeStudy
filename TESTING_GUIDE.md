# DeStudy MVP Testing Guide

## Prerequisites

1. **Hardhat Node**: Running on port 8545
2. **Frontend Server**: Running on http://localhost:3001
3. **MetaMask**: Installed and configured for localhost network

## Setup MetaMask for Testing

### Add Localhost Network
1. Open MetaMask
2. Click network dropdown → Add Network → Add Network Manually
3. Configure:
   - **Network Name**: Localhost 8545
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### Import Test Account
Import one of Hardhat's default accounts:
- **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Balance**: ~10,000 ETH

## Testing Flow

### 1. Connect Wallet
1. Navigate to http://localhost:3001
2. Click "Connect Wallet" in the header
3. Select MetaMask and approve connection
4. Verify wallet address is displayed

### 2. Upload & Mint Note
1. Click "Upload Notes" or navigate to /upload
2. **File Upload**:
   - Drop or select a test file (PDF, MD, PNG, or JPG)
   - Max size: 50MB
   - Wait for IPFS upload to complete
3. **Mint NFT**:
   - Enter Course ID (e.g., "CS101")
   - Enter Version (e.g., "v1.0")
   - Click "Mint Note NFT"
   - Approve transaction in MetaMask
   - Wait for confirmation
4. **Verify**:
   - Success message should appear
   - Note the token ID in the success message

### 3. Explore Notes
1. Navigate to /explore
2. **Verify**:
   - Your minted note appears in the grid
   - Card shows Course ID, author address, version
   - Shows "0 ETH" in total tips (for new note)
   - Displays creation time (e.g., "5s ago")
3. Click on the note card

### 4. View Note Details
1. On note detail page, verify:
   - Correct metadata displayed
   - Author address matches your wallet
   - IPFS CID is shown
   - Total tips shows "0 ETH"

### 5. Tip a Note
1. On the note detail page:
   - Select a preset tip amount (0.001, 0.005, 0.01, or 0.05 ETH)
   - OR enter custom amount
   - Click "Send Tip"
   - Approve transaction in MetaMask
   - Wait for confirmation
2. **Verify**:
   - Success message appears
   - Total tips updates to show the tip amount
   - Statistics section reflects new tip total

### 6. Check Profile & Withdraw
1. Navigate to /profile
2. **Verify**:
   - Wallet address is displayed
   - Pending Balance shows your earnings (85% of tips received)
   - If you tipped your own note:
     - 0.001 ETH tip = 0.00085 ETH pending balance
3. **Withdraw**:
   - Click "Withdraw" button
   - Approve transaction in MetaMask
   - Wait for confirmation
4. **Verify**:
   - Success message appears
   - Pending balance returns to 0 ETH
   - Check MetaMask balance increased

### 7. Multi-User Testing (Optional)
1. Import a second Hardhat account:
   - **Private Key**: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - **Address**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
2. Switch to this account in MetaMask
3. Connect wallet and browse notes
4. Tip notes created by the first account
5. Switch back to first account
6. Check profile - pending balance should show 85% of tip

## Expected Contract Behavior

### Tip Distribution
- **Author**: 85% of tip amount
- **Contributors Pool**: 10% (not yet implemented)
- **Treasury**: 5% (goes to deployer address)

### Token IDs
- Starts at 0
- Increments by 1 for each mint
- Token ID = totalSupply - 1 (for latest note)

## Troubleshooting

### "Network Error" or "Cannot connect"
- Ensure Hardhat node is running: `npx hardhat node`
- Check MetaMask is on Localhost 8545 network
- Verify RPC URL is http://localhost:8545

### "Transaction Failed"
- Check you have enough ETH for gas
- Ensure contract addresses are correct
- Check browser console for detailed error

### "File Upload Fails"
- Check file size < 50MB
- Verify file type is PDF, MD, PNG, or JPG
- Check browser console for errors

### Frontend Won't Start
- Ensure dependencies installed: `npm install`
- Check port 3001 is available
- View console for error messages

## Contract Addresses
- **NoteNFT**: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`
- **RewardVault**: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## Test Data Examples

### Sample Course IDs
- CS101, CS202, MATH301
- PHYS201, CHEM101, BIO220
- ENG101, HIST150, PSY100

### Sample Versions
- v1.0, v1.1, v2.0
- Fall2024, Spring2025
- Midterm, Final, Week1-5

### Sample Files
- Create simple markdown files
- Use any PDF from your system
- Screenshots or diagrams (PNG/JPG)

## Success Criteria

- Wallet connects successfully  
- File uploads to IPFS (mock)  
- NFT mints with correct metadata  
- Note appears in explore page  
- Note detail page displays correctly  
- Tipping transaction completes  
- Tip amount updates in UI  
- Pending balance shows in profile  
- Withdrawal transaction succeeds  
- Balance updates after withdrawal  

