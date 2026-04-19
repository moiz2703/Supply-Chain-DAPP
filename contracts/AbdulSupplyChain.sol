// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AbdulSupplyChain
 * @author Abdul
 * @notice A supply chain management smart contract on Polygon
 */
contract AbdulSupplyChain {

    // ─── Enums ───────────────────────────────────────────────────────────────

    enum Role { None, Manufacturer, Distributor, Retailer, Customer }

    enum ProductStatus { Manufactured, InTransit, Delivered }

    // ─── Structs ─────────────────────────────────────────────────────────────

    struct Product {
        uint256 id;
        string  name;
        string  description;
        address currentOwner;
        ProductStatus status;
        bool    exists;
    }

    struct HistoryEntry {
        address from;
        address to;
        ProductStatus status;
        uint256 timestamp;
        string  note;
    }

    // ─── State Variables ──────────────────────────────────────────────────────

    address public admin;
    uint256 private _productCounter;

    mapping(address => Role)                        public roles;
    mapping(uint256 => Product)                     public products;
    mapping(uint256 => HistoryEntry[])              private productHistory;

    // ─── Events ───────────────────────────────────────────────────────────────

    event RoleAssigned(address indexed account, Role role);
    event ProductRegistered(uint256 indexed productId, string name, address manufacturer);
    event OwnershipTransferred(uint256 indexed productId, address indexed from, address indexed to, ProductStatus newStatus);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyManufacturer() {
        require(roles[msg.sender] == Role.Manufacturer, "Only Manufacturer can call this");
        _;
    }

    modifier onlyCurrentOwner(uint256 productId) {
        require(products[productId].currentOwner == msg.sender, "You are not the current owner");
        _;
    }

    modifier productExists(uint256 productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
        // Admin is also a Manufacturer by default
        roles[msg.sender] = Role.Manufacturer;
        emit RoleAssigned(msg.sender, Role.Manufacturer);
    }

    // ─── Role Management ──────────────────────────────────────────────────────

    /**
     * @notice Assign a role to an address (admin only)
     */
    function assignRole(address account, Role role) external onlyAdmin {
        require(account != address(0), "Invalid address");
        require(role != Role.None, "Cannot assign None role");
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    /**
     * @notice Get role of any address
     */
    function getRole(address account) external view returns (Role) {
        return roles[account];
    }

    // ─── Product Management ───────────────────────────────────────────────────

    /**
     * @notice Register a new product — Manufacturer only
     */
    function registerProduct(
        string calldata name,
        string calldata description
    ) external onlyManufacturer returns (uint256) {
        _productCounter++;
        uint256 newId = _productCounter;

        products[newId] = Product({
            id:           newId,
            name:         name,
            description:  description,
            currentOwner: msg.sender,
            status:       ProductStatus.Manufactured,
            exists:       true
        });

        productHistory[newId].push(HistoryEntry({
            from:      address(0),
            to:        msg.sender,
            status:    ProductStatus.Manufactured,
            timestamp: block.timestamp,
            note:      "Product manufactured and registered"
        }));

        emit ProductRegistered(newId, name, msg.sender);
        return newId;
    }

    /**
     * @notice Transfer product ownership to the next role in the chain
     * @dev Manufacturer → Distributor → Retailer → Customer
     */
    function transferOwnership(
        uint256 productId,
        address to,
        string calldata note
    )
        external
        productExists(productId)
        onlyCurrentOwner(productId)
    {
        Role senderRole = roles[msg.sender];
        Role receiverRole = roles[to];

        // Enforce sequential role transfer
        if (senderRole == Role.Manufacturer) {
            require(receiverRole == Role.Distributor, "Manufacturer can only transfer to Distributor");
        } else if (senderRole == Role.Distributor) {
            require(receiverRole == Role.Retailer, "Distributor can only transfer to Retailer");
        } else if (senderRole == Role.Retailer) {
            require(receiverRole == Role.Customer, "Retailer can only transfer to Customer");
        } else {
            revert("Current owner cannot transfer");
        }

        ProductStatus newStatus = (receiverRole == Role.Customer)
            ? ProductStatus.Delivered
            : ProductStatus.InTransit;

        address previousOwner = products[productId].currentOwner;
        products[productId].currentOwner = to;
        products[productId].status = newStatus;

        productHistory[productId].push(HistoryEntry({
            from:      previousOwner,
            to:        to,
            status:    newStatus,
            timestamp: block.timestamp,
            note:      note
        }));

        emit OwnershipTransferred(productId, previousOwner, to, newStatus);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    /**
     * @notice Get product details
     */
    function getProduct(uint256 productId)
        external
        view
        productExists(productId)
        returns (
            uint256 id,
            string memory name,
            string memory description,
            address currentOwner,
            ProductStatus status
        )
    {
        Product memory p = products[productId];
        return (p.id, p.name, p.description, p.currentOwner, p.status);
    }

    /**
     * @notice Get the full audit trail of a product
     */
    function getProductHistory(uint256 productId)
        external
        view
        productExists(productId)
        returns (HistoryEntry[] memory)
    {
        return productHistory[productId];
    }

    /**
     * @notice Get total number of products registered
     */
    function getTotalProducts() external view returns (uint256) {
        return _productCounter;
    }
}