# Smart Contract Specifications v0.1

**Date**: 2025-11-10
**Status**: Draft
**Solidity Version**: 0.8.20+

---

## 1. Overview

DeStudy requires three core smart contracts:

1. **NoteNFT**: ERC-721 token representing study notes with metadata
2. **RewardVault**: Revenue management with automatic splits and pull payments
3. **AccessMarket**: (Optional) Paid unlock system for premium notes

---

## 2. NoteNFT Contract

### 2.1 Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NoteNFT
 * @notice ERC-721 NFT representing study notes stored on IPFS
 * @dev Supports EIP-2981 for optional royalty information
 */
interface INoteNFT is IERC721, IERC2981 {
    /// @notice Emitted when a new note is minted
    /// @param tokenId The ID of the newly minted token
    /// @param author The address of the note author
    /// @param cid The IPFS CID of the note content
    /// @param version The version string of the note
    /// @param timestamp The block timestamp of minting
    event NoteMinted(
        uint256 indexed tokenId,
        address indexed author,
        string cid,
        string version,
        uint256 timestamp
    );

    /// @notice Emitted when note metadata is updated
    event NoteMetadataUpdated(uint256 indexed tokenId, string newCid, string newVersion);

    /// @notice Struct containing note metadata
    struct NoteMetadata {
        address author;           // Original author
        string cid;              // IPFS content CID
        string courseId;         // Course identifier (e.g., "IKNS-5300")
        string version;          // Version string (e.g., "v1.0")
        string previewCid;       // IPFS preview image CID (optional)
        uint256 createdAt;       // Creation timestamp
        uint256 updatedAt;       // Last update timestamp
    }

    /// @notice Mint a new note NFT
    /// @param to The address to mint to
    /// @param cid The IPFS CID of the note content
    /// @param courseId The course identifier
    /// @param version The version string
    /// @param previewCid The IPFS CID of the preview image (optional)
    /// @return tokenId The ID of the newly minted token
    function mintNote(
        address to,
        string calldata cid,
        string calldata courseId,
        string calldata version,
        string calldata previewCid
    ) external returns (uint256 tokenId);

    /// @notice Update note metadata (author only)
    /// @param tokenId The token ID to update
    /// @param newCid The new IPFS CID
    /// @param newVersion The new version string
    function updateNoteMetadata(
        uint256 tokenId,
        string calldata newCid,
        string calldata newVersion
    ) external;

    /// @notice Get note metadata
    /// @param tokenId The token ID to query
    /// @return metadata The note metadata struct
    function getNoteMetadata(uint256 tokenId) external view returns (NoteMetadata memory metadata);

    /// @notice Get the author of a note
    /// @param tokenId The token ID to query
    /// @return author The author address
    function authorOf(uint256 tokenId) external view returns (address author);

    /// @notice Get total supply of minted notes
    /// @return supply The total number of notes minted
    function totalSupply() external view returns (uint256 supply);

    /// @notice Set royalty info (EIP-2981)
    /// @param receiver The royalty receiver address
    /// @param feeNumerator The royalty fee in basis points (e.g., 250 = 2.5%)
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external;
}
```

### 2.2 Implementation Details

**Storage Layout**:
```solidity
contract NoteNFT is ERC721URIStorage, Ownable, ReentrancyGuard, ERC2981 {
    // Counter for token IDs
    uint256 private _nextTokenId;

    // Mapping from token ID to metadata
    mapping(uint256 => NoteMetadata) private _noteMetadata;

    // Mapping from author to list of token IDs
    mapping(address => uint256[]) private _authorNotes;

    // Maximum string lengths for validation
    uint256 public constant MAX_CID_LENGTH = 100;
    uint256 public constant MAX_COURSE_ID_LENGTH = 50;
    uint256 public constant MAX_VERSION_LENGTH = 20;

    // Base URI for metadata
    string private _baseTokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
    }
}
```

**Key Functions Implementation**:

```solidity
function mintNote(
    address to,
    string calldata cid,
    string calldata courseId,
    string calldata version,
    string calldata previewCid
) external nonReentrant returns (uint256 tokenId) {
    // Input validation
    require(to != address(0), "NoteNFT: mint to zero address");
    require(bytes(cid).length > 0 && bytes(cid).length <= MAX_CID_LENGTH, "NoteNFT: invalid CID");
    require(bytes(courseId).length > 0 && bytes(courseId).length <= MAX_COURSE_ID_LENGTH, "NoteNFT: invalid courseId");
    require(bytes(version).length > 0 && bytes(version).length <= MAX_VERSION_LENGTH, "NoteNFT: invalid version");

    // Increment and get token ID
    tokenId = _nextTokenId++;

    // Mint the token
    _safeMint(to, tokenId);

    // Store metadata
    _noteMetadata[tokenId] = NoteMetadata({
        author: to,
        cid: cid,
        courseId: courseId,
        version: version,
        previewCid: previewCid,
        createdAt: block.timestamp,
        updatedAt: block.timestamp
    });

    // Track author notes
    _authorNotes[to].push(tokenId);

    // Set token URI (metadata JSON on IPFS)
    string memory tokenURI = string(abi.encodePacked("ipfs://", cid, "/metadata.json"));
    _setTokenURI(tokenId, tokenURI);

    // Emit event
    emit NoteMinted(tokenId, to, cid, version, block.timestamp);

    return tokenId;
}

function updateNoteMetadata(
    uint256 tokenId,
    string calldata newCid,
    string calldata newVersion
) external {
    // Only author can update
    require(_noteMetadata[tokenId].author == msg.sender, "NoteNFT: not the author");
    require(_exists(tokenId), "NoteNFT: token does not exist");
    require(bytes(newCid).length > 0 && bytes(newCid).length <= MAX_CID_LENGTH, "NoteNFT: invalid CID");
    require(bytes(newVersion).length > 0 && bytes(newVersion).length <= MAX_VERSION_LENGTH, "NoteNFT: invalid version");

    // Update metadata
    _noteMetadata[tokenId].cid = newCid;
    _noteMetadata[tokenId].version = newVersion;
    _noteMetadata[tokenId].updatedAt = block.timestamp;

    // Update token URI
    string memory tokenURI = string(abi.encodePacked("ipfs://", newCid, "/metadata.json"));
    _setTokenURI(tokenId, tokenURI);

    // Emit event
    emit NoteMetadataUpdated(tokenId, newCid, newVersion);
}

function getNoteMetadata(uint256 tokenId) external view returns (NoteMetadata memory) {
    require(_exists(tokenId), "NoteNFT: token does not exist");
    return _noteMetadata[tokenId];
}

function authorOf(uint256 tokenId) external view returns (address) {
    require(_exists(tokenId), "NoteNFT: token does not exist");
    return _noteMetadata[tokenId].author;
}

function totalSupply() external view returns (uint256) {
    return _nextTokenId;
}

// Override supportsInterface to include ERC2981
function supportsInterface(bytes4 interfaceId)
    public
    view
    virtual
    override(ERC721URIStorage, ERC2981)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}
```

**Gas Optimization Notes**:
- Use `calldata` for string parameters (cheaper than `memory`)
- Pack struct fields efficiently (address + uint256 alignment)
- Limit string length validation
- Avoid unnecessary storage reads

**Security Considerations**:
- Reentrancy guard on minting
- Input validation (length checks, zero address)
- Author-only metadata updates
- No transferability restrictions (users can sell NFTs)

---

## 3. RewardVault Contract

### 3.1 Interface

```solidity
/**
 * @title IRewardVault
 * @notice Manages tipping and revenue distribution with pull payments
 */
interface IRewardVault {
    /// @notice Emitted when a tip is received
    event TipReceived(
        uint256 indexed tokenId,
        address indexed from,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Emitted when funds are withdrawn
    event Withdrawn(address indexed account, uint256 amount);

    /// @notice Emitted when split configuration is updated
    event SplitConfigUpdated(
        uint256 authorBps,
        uint256 contributorsBps,
        uint256 treasuryBps
    );

    /// @notice Revenue split configuration (in basis points, 10000 = 100%)
    struct SplitConfig {
        uint96 authorBps;        // e.g., 8500 = 85%
        uint96 contributorsBps;  // e.g., 1000 = 10%
        uint96 treasuryBps;      // e.g., 500 = 5%
    }

    /// @notice Send a tip to a note
    /// @param tokenId The note token ID
    function tip(uint256 tokenId) external payable;

    /// @notice Withdraw pending balance (pull payment)
    function withdraw() external;

    /// @notice Get pending balance for an account
    /// @param account The account address
    /// @return balance The pending balance
    function pending(address account) external view returns (uint256 balance);

    /// @notice Get total tips received by a note
    /// @param tokenId The note token ID
    /// @return total The total tips amount
    function totalTips(uint256 tokenId) external view returns (uint256 total);

    /// @notice Update split configuration (owner only)
    /// @param config The new split configuration
    function updateSplitConfig(SplitConfig calldata config) external;

    /// @notice Set treasury address (owner only)
    /// @param treasury The new treasury address
    function setTreasury(address treasury) external;

    /// @notice Set the NoteNFT contract address (owner only)
    /// @param noteNFT The NoteNFT contract address
    function setNoteNFT(address noteNFT) external;
}
```

### 3.2 Implementation Details

**Storage Layout**:
```solidity
contract RewardVault is Ownable, ReentrancyGuard {
    // NoteNFT contract reference
    INoteNFT public noteNFT;

    // Treasury address
    address public treasury;

    // Revenue split configuration (in basis points)
    SplitConfig public splitConfig;

    // Mapping from account to pending balance (pull payment)
    mapping(address => uint256) private _pendingBalances;

    // Mapping from token ID to total tips received
    mapping(uint256 => uint256) private _totalTips;

    // Basis points denominator (100% = 10000)
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Minimum tip amount (to avoid dust)
    uint256 public constant MIN_TIP_AMOUNT = 0.001 ether;

    constructor(
        address _noteNFT,
        address _treasury,
        SplitConfig memory _splitConfig
    ) {
        require(_noteNFT != address(0), "RewardVault: invalid NoteNFT");
        require(_treasury != address(0), "RewardVault: invalid treasury");
        require(
            _splitConfig.authorBps + _splitConfig.contributorsBps + _splitConfig.treasuryBps == BPS_DENOMINATOR,
            "RewardVault: invalid split config"
        );

        noteNFT = INoteNFT(_noteNFT);
        treasury = _treasury;
        splitConfig = _splitConfig;
    }
}
```

**Key Functions Implementation**:

```solidity
function tip(uint256 tokenId) external payable nonReentrant {
    require(msg.value >= MIN_TIP_AMOUNT, "RewardVault: tip too small");

    // Verify token exists
    address author = noteNFT.authorOf(tokenId);
    require(author != address(0), "RewardVault: token does not exist");

    // Calculate splits
    uint256 authorAmount = (msg.value * splitConfig.authorBps) / BPS_DENOMINATOR;
    uint256 contributorsAmount = (msg.value * splitConfig.contributorsBps) / BPS_DENOMINATOR;
    uint256 treasuryAmount = msg.value - authorAmount - contributorsAmount; // Remainder to avoid rounding issues

    // Update pending balances (pull payment pattern)
    _pendingBalances[author] += authorAmount;
    _pendingBalances[treasury] += treasuryAmount;

    // For MVP, contributors amount goes to treasury
    // TODO: Implement contributor distribution in future versions
    _pendingBalances[treasury] += contributorsAmount;

    // Update total tips for this note
    _totalTips[tokenId] += msg.value;

    // Emit event
    emit TipReceived(tokenId, msg.sender, msg.value, block.timestamp);
}

function withdraw() external nonReentrant {
    uint256 amount = _pendingBalances[msg.sender];
    require(amount > 0, "RewardVault: no pending balance");

    // Clear balance before transfer (checks-effects-interactions)
    _pendingBalances[msg.sender] = 0;

    // Transfer funds
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    require(success, "RewardVault: transfer failed");

    // Emit event
    emit Withdrawn(msg.sender, amount);
}

function pending(address account) external view returns (uint256) {
    return _pendingBalances[account];
}

function totalTips(uint256 tokenId) external view returns (uint256) {
    return _totalTips[tokenId];
}

function updateSplitConfig(SplitConfig calldata config) external onlyOwner {
    require(
        config.authorBps + config.contributorsBps + config.treasuryBps == BPS_DENOMINATOR,
        "RewardVault: invalid split config"
    );
    splitConfig = config;
    emit SplitConfigUpdated(config.authorBps, config.contributorsBps, config.treasuryBps);
}

function setTreasury(address _treasury) external onlyOwner {
    require(_treasury != address(0), "RewardVault: invalid treasury");
    treasury = _treasury;
}

function setNoteNFT(address _noteNFT) external onlyOwner {
    require(_noteNFT != address(0), "RewardVault: invalid NoteNFT");
    noteNFT = INoteNFT(_noteNFT);
}
```

**Security Considerations**:
- Pull payment pattern (no automatic transfers in `tip()`)
- Checks-effects-interactions pattern in `withdraw()`
- Reentrancy guard on all external functions
- Input validation (amounts, addresses, splits)
- No division by zero (BPS_DENOMINATOR is constant)

**Gas Optimization**:
- Use basis points (uint96) to pack split config
- Single storage write per tip (no loops)
- Avoid unnecessary reads (cache values)

---

## 4. AccessMarket Contract (Optional for MVP)

### 4.1 Interface

```solidity
/**
 * @title IAccessMarket
 * @notice Manages paid access to premium notes
 */
interface IAccessMarket {
    /// @notice Emitted when access is purchased
    event AccessPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price,
        uint256 timestamp
    );

    /// @notice Emitted when access price is updated
    event PriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    /// @notice Set access price for a note (author only)
    /// @param tokenId The note token ID
    /// @param price The access price (0 = free)
    function setPrice(uint256 tokenId, uint256 price) external;

    /// @notice Purchase access to a note
    /// @param tokenId The note token ID
    function buy(uint256 tokenId) external payable;

    /// @notice Check if an address has access to a note
    /// @param tokenId The note token ID
    /// @param account The account address
    /// @return hasAccess True if account has access
    function hasAccess(uint256 tokenId, address account) external view returns (bool hasAccess);

    /// @notice Get access price for a note
    /// @param tokenId The note token ID
    /// @return price The access price (0 = free)
    function getPrice(uint256 tokenId) external view returns (uint256 price);
}
```

### 4.2 Implementation Details

```solidity
contract AccessMarket is Ownable, ReentrancyGuard {
    INoteNFT public noteNFT;
    IRewardVault public rewardVault;

    // Mapping from token ID to access price
    mapping(uint256 => uint256) private _prices;

    // Mapping from token ID to mapping of buyer addresses (who has purchased access)
    mapping(uint256 => mapping(address => bool)) private _access;

    constructor(address _noteNFT, address _rewardVault) {
        require(_noteNFT != address(0), "AccessMarket: invalid NoteNFT");
        require(_rewardVault != address(0), "AccessMarket: invalid RewardVault");
        noteNFT = INoteNFT(_noteNFT);
        rewardVault = IRewardVault(_rewardVault);
    }

    function setPrice(uint256 tokenId, uint256 price) external {
        address author = noteNFT.authorOf(tokenId);
        require(author == msg.sender, "AccessMarket: not the author");

        uint256 oldPrice = _prices[tokenId];
        _prices[tokenId] = price;

        emit PriceUpdated(tokenId, oldPrice, price);
    }

    function buy(uint256 tokenId) external payable nonReentrant {
        uint256 price = _prices[tokenId];
        require(price > 0, "AccessMarket: note is free");
        require(msg.value >= price, "AccessMarket: insufficient payment");
        require(!_access[tokenId][msg.sender], "AccessMarket: already purchased");

        // Grant access
        _access[tokenId][msg.sender] = true;

        // Forward payment to RewardVault (will be split there)
        rewardVault.tip{value: msg.value}(tokenId);

        // Refund excess payment
        if (msg.value > price) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(success, "AccessMarket: refund failed");
        }

        emit AccessPurchased(tokenId, msg.sender, price, block.timestamp);
    }

    function hasAccess(uint256 tokenId, address account) external view returns (bool) {
        // Free notes or note owner always has access
        if (_prices[tokenId] == 0 || noteNFT.ownerOf(tokenId) == account) {
            return true;
        }
        return _access[tokenId][account];
    }

    function getPrice(uint256 tokenId) external view returns (uint256) {
        return _prices[tokenId];
    }
}
```

**Note**: AccessMarket is optional for MVP. Consider implementing in a later phase.

---

## 5. Deployment Strategy

### 5.1 Deployment Order

1. Deploy `NoteNFT` with:
   - name: "DeStudy Note"
   - symbol: "DNOTE"
   - baseURI: "ipfs://"

2. Deploy `RewardVault` with:
   - noteNFT address from step 1
   - treasury address (multisig or EOA)
   - splitConfig: { authorBps: 8500, contributorsBps: 1000, treasuryBps: 500 }

3. (Optional) Deploy `AccessMarket` with:
   - noteNFT address
   - rewardVault address

### 5.2 Deployment Script (Hardhat)

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy NoteNFT
  const NoteNFT = await hre.ethers.getContractFactory("NoteNFT");
  const noteNFT = await NoteNFT.deploy(
    "DeStudy Note",
    "DNOTE",
    "ipfs://"
  );
  await noteNFT.waitForDeployment();
  console.log("NoteNFT deployed to:", await noteNFT.getAddress());

  // Deploy RewardVault
  const RewardVault = await hre.ethers.getContractFactory("RewardVault");
  const rewardVault = await RewardVault.deploy(
    await noteNFT.getAddress(),
    process.env.TREASURY_ADDRESS || deployer.address,
    {
      authorBps: 8500,
      contributorsBps: 1000,
      treasuryBps: 500
    }
  );
  await rewardVault.waitForDeployment();
  console.log("RewardVault deployed to:", await rewardVault.getAddress());

  // Save deployment addresses
  const deployments = {
    network: hre.network.name,
    noteNFT: await noteNFT.getAddress(),
    rewardVault: await rewardVault.getAddress(),
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deployments, null, 2)
  );

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 5.3 Verification Script

```javascript
// scripts/verify.js
const hre = require("hardhat");
const deployments = require(`../deployments/${hre.network.name}.json`);

async function main() {
  console.log("Verifying contracts on", hre.network.name);

  // Verify NoteNFT
  await hre.run("verify:verify", {
    address: deployments.noteNFT,
    constructorArguments: [
      "DeStudy Note",
      "DNOTE",
      "ipfs://"
    ]
  });

  // Verify RewardVault
  await hre.run("verify:verify", {
    address: deployments.rewardVault,
    constructorArguments: [
      deployments.noteNFT,
      process.env.TREASURY_ADDRESS,
      {
        authorBps: 8500,
        contributorsBps: 1000,
        treasuryBps: 500
      }
    ]
  });

  console.log("Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## 6. Testing Requirements

### 6.1 Unit Tests

**NoteNFT Tests**:
- ✓ Mint note with valid parameters
- ✓ Revert on invalid CID/courseId/version
- ✓ Update metadata (author only)
- ✓ Revert on non-author update
- ✓ Get metadata
- ✓ Get author
- ✓ Total supply increments correctly
- ✓ Token URI is correctly set
- ✓ Supports ERC721 and ERC2981 interfaces

**RewardVault Tests**:
- ✓ Tip with valid amount
- ✓ Revert on tip below minimum
- ✓ Revert on tip to non-existent token
- ✓ Split calculation is accurate
- ✓ Pending balance is updated correctly
- ✓ Withdraw clears balance
- ✓ Withdraw transfers correct amount
- ✓ Revert on withdraw with no balance
- ✓ Update split config (owner only)
- ✓ Revert on invalid split config
- ✓ Total tips is tracked correctly

**AccessMarket Tests** (if implemented):
- ✓ Set price (author only)
- ✓ Buy access with correct price
- ✓ Revert on insufficient payment
- ✓ Revert on duplicate purchase
- ✓ Has access check
- ✓ Free notes are accessible

### 6.2 Integration Tests

- ✓ Mint note → Tip → Withdraw flow
- ✓ Multiple tips accumulate correctly
- ✓ Multiple users withdraw independently
- ✓ Update metadata → URI changes
- ✓ (Optional) Set price → Buy access → Check access

### 6.3 Gas Benchmarks

Target gas usage:
- `mintNote`: < 150k gas
- `tip`: < 100k gas
- `withdraw`: < 50k gas
- `updateNoteMetadata`: < 80k gas

### 6.4 Security Tests

- ✓ Reentrancy attack on tip/withdraw
- ✓ Integer overflow/underflow
- ✓ Access control enforcement
- ✓ Zero address checks
- ✓ Front-running resistance (pull payment)

---

## 7. Audit Checklist

Before mainnet deployment:

- [ ] All unit tests pass with 100% coverage
- [ ] Integration tests cover critical paths
- [ ] Gas benchmarks within targets
- [ ] Slither static analysis (no high/medium issues)
- [ ] Manual code review by 2+ developers
- [ ] External audit (if budget allows)
- [ ] Testnet deployment and manual testing
- [ ] Emergency pause mechanism tested
- [ ] Ownership transfer tested
- [ ] Event emission verified

---

## 8. Upgrade Strategy (Future)

For MVP, contracts are **immutable** (no upgradeability). If upgrades are needed:

**Option 1: Redeploy**
- Deploy new contract versions
- Migrate state if necessary
- Update frontend to use new addresses

**Option 2: Proxy Pattern** (future consideration)
- Use UUPS or Transparent Proxy
- Requires additional testing and complexity
- Adds gas overhead

**Recommendation**: Start with immutable contracts for simplicity and security. Add upgradeability only if critical bugs are found.

---

## 9. Open Questions

1. **Collaborator Distribution**: How to split the 10% contributor share?
   - Option A: Manual splits set by author
   - Option B: ERC-1155 for fractional ownership
   - Option C: Off-chain calculation, on-chain payout
   - **MVP Decision**: Route to treasury, implement later

2. **Royalties (EIP-2981)**: Should secondary sales on OpenSea generate royalties?
   - **MVP Decision**: 0% royalties for MVP, can be enabled later

3. **Access Control**: Should there be a minter role or is open minting acceptable?
   - **MVP Decision**: Open minting (anyone can mint)

4. **Emergency Controls**: Should there be a pause mechanism?
   - **MVP Decision**: No pause for MVP (immutable), add in v2 if needed

5. **Price Oracle**: Should tip amounts be denominated in USD equivalent?
   - **MVP Decision**: Native ETH only for MVP

---

## 10. Contract Addresses

### Testnet (Base Sepolia)
- NoteNFT: `TBD`
- RewardVault: `TBD`
- AccessMarket: `TBD`

### Mainnet
- NoteNFT: `TBD`
- RewardVault: `TBD`
- AccessMarket: `TBD`

---

## 11. References

- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts
- EIP-721: https://eips.ethereum.org/EIPS/eip-721
- EIP-2981: https://eips.ethereum.org/EIPS/eip-2981
- Solidity Style Guide: https://docs.soliditylang.org/en/latest/style-guide.html
- Smart Contract Best Practices: https://consensys.github.io/smart-contract-best-practices/

---

**Document Version**: 0.1
**Last Updated**: 2025-11-10
**Next Review**: After contract implementation (D5)
