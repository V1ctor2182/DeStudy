// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface INoteNFT {
    function authorOf(uint256 tokenId) external view returns (address);
}

/**
 * @title RewardVault
 * @notice Manages tipping and revenue distribution with pull payments
 */
contract RewardVault is Ownable, ReentrancyGuard {
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

    /**
     * @notice Constructor
     * @param _noteNFT The NoteNFT contract address
     * @param _treasury The treasury address
     * @param _splitConfig The initial split configuration
     */
    constructor(
        address _noteNFT,
        address _treasury,
        SplitConfig memory _splitConfig
    ) Ownable(msg.sender) {
        require(_noteNFT != address(0), "RewardVault: invalid NoteNFT");
        require(_treasury != address(0), "RewardVault: invalid treasury");
        require(
            _splitConfig.authorBps +
                _splitConfig.contributorsBps +
                _splitConfig.treasuryBps ==
                BPS_DENOMINATOR,
            "RewardVault: invalid split config"
        );

        noteNFT = INoteNFT(_noteNFT);
        treasury = _treasury;
        splitConfig = _splitConfig;
    }

    /**
     * @notice Send a tip to a note
     * @param tokenId The note token ID
     */
    function tip(uint256 tokenId) external payable nonReentrant {
        require(msg.value >= MIN_TIP_AMOUNT, "RewardVault: tip too small");

        // Verify token exists and get author
        address author = noteNFT.authorOf(tokenId);
        require(author != address(0), "RewardVault: token does not exist");

        // Calculate splits
        uint256 authorAmount = (msg.value * splitConfig.authorBps) /
            BPS_DENOMINATOR;
        uint256 contributorsAmount = (msg.value *
            splitConfig.contributorsBps) / BPS_DENOMINATOR;
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

    /**
     * @notice Withdraw pending balance (pull payment)
     */
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

    /**
     * @notice Get pending balance for an account
     * @param account The account address
     * @return balance The pending balance
     */
    function pending(address account) external view returns (uint256 balance) {
        return _pendingBalances[account];
    }

    /**
     * @notice Get total tips received by a note
     * @param tokenId The note token ID
     * @return total The total tips amount
     */
    function totalTips(uint256 tokenId) external view returns (uint256 total) {
        return _totalTips[tokenId];
    }

    /**
     * @notice Update split configuration (owner only)
     * @param config The new split configuration
     */
    function updateSplitConfig(SplitConfig calldata config)
        external
        onlyOwner
    {
        require(
            config.authorBps + config.contributorsBps + config.treasuryBps ==
                BPS_DENOMINATOR,
            "RewardVault: invalid split config"
        );
        splitConfig = config;
        emit SplitConfigUpdated(
            config.authorBps,
            config.contributorsBps,
            config.treasuryBps
        );
    }

    /**
     * @notice Set treasury address (owner only)
     * @param _treasury The new treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "RewardVault: invalid treasury");
        treasury = _treasury;
    }

    /**
     * @notice Set the NoteNFT contract address (owner only)
     * @param _noteNFT The NoteNFT contract address
     */
    function setNoteNFT(address _noteNFT) external onlyOwner {
        require(_noteNFT != address(0), "RewardVault: invalid NoteNFT");
        noteNFT = INoteNFT(_noteNFT);
    }

    /**
     * @notice Allow contract to receive ETH
     */
    receive() external payable {}
}
