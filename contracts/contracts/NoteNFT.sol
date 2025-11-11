// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title NoteNFT
 * @notice ERC-721 NFT representing study notes stored on IPFS
 * @dev Supports EIP-2981 for optional royalty information
 */
contract NoteNFT is ERC721URIStorage, Ownable, ReentrancyGuard, IERC2981 {
    /// @notice Emitted when a new note is minted
    event NoteMinted(
        uint256 indexed tokenId,
        address indexed author,
        string cid,
        string version,
        uint256 timestamp
    );

    /// @notice Emitted when note metadata is updated
    event NoteMetadataUpdated(
        uint256 indexed tokenId,
        string newCid,
        string newVersion
    );

    /// @notice Emitted when a note is burned
    event NoteBurned(
        uint256 indexed tokenId,
        address indexed author,
        uint256 timestamp
    );

    /// @notice Struct containing note metadata
    struct NoteMetadata {
        address author;      // Original author
        string cid;          // IPFS content CID
        string courseId;     // Course identifier (e.g., "IKNS-5300")
        string version;      // Version string (e.g., "v1.0")
        string previewCid;   // IPFS preview image CID (optional)
        uint256 createdAt;   // Creation timestamp
        uint256 updatedAt;   // Last update timestamp
    }

    // Counter for token IDs
    uint256 private _nextTokenId;

    // Mapping from token ID to metadata
    mapping(uint256 => NoteMetadata) private _noteMetadata;

    // Maximum string lengths for validation
    uint256 public constant MAX_CID_LENGTH = 100;
    uint256 public constant MAX_COURSE_ID_LENGTH = 50;
    uint256 public constant MAX_VERSION_LENGTH = 20;

    // Base URI for metadata
    string private _baseTokenURI;

    // Royalty info (EIP-2981)
    address private _royaltyReceiver;
    uint96 private _royaltyFeeNumerator; // In basis points (e.g., 250 = 2.5%)

    /**
     * @notice Constructor
     * @param name Token name
     * @param symbol Token symbol
     * @param baseURI Base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint a new note NFT
     * @param to The address to mint to
     * @param cid The IPFS CID of the note content
     * @param courseId The course identifier
     * @param version The version string
     * @param previewCid The IPFS CID of the preview image (optional)
     * @return tokenId The ID of the newly minted token
     */
    function mintNote(
        address to,
        string calldata cid,
        string calldata courseId,
        string calldata version,
        string calldata previewCid
    ) external nonReentrant returns (uint256 tokenId) {
        // Input validation
        require(to != address(0), "NoteNFT: mint to zero address");
        require(
            bytes(cid).length > 0 && bytes(cid).length <= MAX_CID_LENGTH,
            "NoteNFT: invalid CID"
        );
        require(
            bytes(courseId).length > 0 &&
                bytes(courseId).length <= MAX_COURSE_ID_LENGTH,
            "NoteNFT: invalid courseId"
        );
        require(
            bytes(version).length > 0 &&
                bytes(version).length <= MAX_VERSION_LENGTH,
            "NoteNFT: invalid version"
        );

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

        // Set token URI (metadata JSON on IPFS)
        // Note: baseURI is "ipfs://", so we only need CID + path
        string memory tokenURI = string(
            abi.encodePacked(cid, "/metadata.json")
        );
        _setTokenURI(tokenId, tokenURI);

        // Emit event
        emit NoteMinted(tokenId, to, cid, version, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Update note metadata (author only)
     * @param tokenId The token ID to update
     * @param newCid The new IPFS CID
     * @param newVersion The new version string
     */
    function updateNoteMetadata(
        uint256 tokenId,
        string calldata newCid,
        string calldata newVersion
    ) external {
        // Check token exists first
        require(_ownerOf(tokenId) != address(0), "NoteNFT: token does not exist");
        // Only author can update
        require(
            _noteMetadata[tokenId].author == msg.sender,
            "NoteNFT: not the author"
        );
        require(
            bytes(newCid).length > 0 && bytes(newCid).length <= MAX_CID_LENGTH,
            "NoteNFT: invalid CID"
        );
        require(
            bytes(newVersion).length > 0 &&
                bytes(newVersion).length <= MAX_VERSION_LENGTH,
            "NoteNFT: invalid version"
        );

        // Update metadata
        _noteMetadata[tokenId].cid = newCid;
        _noteMetadata[tokenId].version = newVersion;
        _noteMetadata[tokenId].updatedAt = block.timestamp;

        // Update token URI
        string memory tokenURI = string(
            abi.encodePacked(newCid, "/metadata.json")
        );
        _setTokenURI(tokenId, tokenURI);

        // Emit event
        emit NoteMetadataUpdated(tokenId, newCid, newVersion);
    }

    /**
     * @notice Burn (delete) a note NFT (author only)
     * @param tokenId The token ID to burn
     */
    function burnNote(uint256 tokenId) external nonReentrant {
        // Check token exists first
        require(_ownerOf(tokenId) != address(0), "NoteNFT: token does not exist");
        // Only author can burn
        require(
            _noteMetadata[tokenId].author == msg.sender,
            "NoteNFT: not the author"
        );

        address author = _noteMetadata[tokenId].author;

        // Delete metadata
        delete _noteMetadata[tokenId];

        // Burn the token
        _burn(tokenId);

        // Emit event
        emit NoteBurned(tokenId, author, block.timestamp);
    }

    /**
     * @notice Get note metadata
     * @param tokenId The token ID to query
     * @return metadata The note metadata struct
     */
    function getNoteMetadata(uint256 tokenId)
        external
        view
        returns (NoteMetadata memory metadata)
    {
        require(_ownerOf(tokenId) != address(0), "NoteNFT: token does not exist");
        return _noteMetadata[tokenId];
    }

    /**
     * @notice Get the author of a note
     * @param tokenId The token ID to query
     * @return author The author address
     */
    function authorOf(uint256 tokenId) external view returns (address author) {
        require(_ownerOf(tokenId) != address(0), "NoteNFT: token does not exist");
        return _noteMetadata[tokenId].author;
    }

    /**
     * @notice Get total supply of minted notes
     * @return supply The total number of notes minted
     */
    function totalSupply() external view returns (uint256 supply) {
        return _nextTokenId;
    }

    /**
     * @notice Set default royalty info (EIP-2981)
     * @param receiver The royalty receiver address
     * @param feeNumerator The royalty fee in basis points (e.g., 250 = 2.5%)
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyOwner
    {
        require(receiver != address(0), "NoteNFT: invalid receiver");
        require(feeNumerator <= 10000, "NoteNFT: fee too high");

        _royaltyReceiver = receiver;
        _royaltyFeeNumerator = feeNumerator;
    }

    /**
     * @notice Get royalty info (EIP-2981)
     * @param tokenId The token ID
     * @param salePrice The sale price
     * @return receiver The royalty receiver
     * @return royaltyAmount The royalty amount
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_ownerOf(tokenId) != address(0), "NoteNFT: token does not exist");

        if (_royaltyReceiver == address(0)) {
            return (address(0), 0);
        }

        royaltyAmount = (salePrice * _royaltyFeeNumerator) / 10000;
        return (_royaltyReceiver, royaltyAmount);
    }

    /**
     * @notice Override supportsInterface to include ERC2981
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Set base URI (owner only)
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Override _baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
}
