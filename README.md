# Abdul's Supply Chain DApp

A decentralized application (DApp) for Supply Chain Management built on the **Polygon Amoy Testnet** using **Solidity**, **Hardhat**, and **React**.

---

## Overview

This project implements a blockchain-based supply chain solution that records and tracks products as they move through the chain:

**Manufacturer → Distributor → Retailer → Customer**

Every product transfer is recorded on-chain, ensuring full transparency, traceability, and tamper-proof history.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.20 |
| Development Framework | Hardhat |
| Blockchain Network | Polygon Amoy Testnet |
| Frontend | React.js |
| Blockchain Interaction | Ethers.js v6 |
| Styling | CSS (custom dark theme) |

---

## Project Structure

```
supply-chain-dapp/
├── contracts/
│   └── AbdulSupplyChain.sol      # Main smart contract
├── scripts/
│   └── deploy.js                 # Deployment script
├── test/
│   └── supplychain.test.js       # Contract tests
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Header.js
│       │   ├── Dashboard.js
│       │   ├── RegisterProduct.js
│       │   ├── TransferOwnership.js
│       │   ├── ProductHistory.js
│       │   └── AssignRole.js
│       ├── utils/
│       │   └── contract.js       # ABI & contract address
│       ├── App.js
│       └── App.css
├── hardhat.config.js
├── .env                          # (not pushed) private keys
└── .gitignore
```

---

## Smart Contract Features

- **Roles:** Manufacturer, Distributor, Retailer, Customer
- **Register Products:** Manufacturer registers products with unique ID, name, description
- **Transfer Ownership:** Sequential role-based transfers enforced on-chain
- **Audit Trail:** Full history of every product movement stored on blockchain
- **Access Control:** Role-based function restrictions

---

## Deployment

- **Network:** Polygon Amoy Testnet
- **Contract:** `AbdulSupplyChain.sol`
- **Deployed Address:** `YOUR_CONTRACT_ADDRESS_HERE`

---

## Getting Started

### Prerequisites
- Node.js
- MetaMask browser extension
- POL test tokens from [Polygon Faucet](https://faucet.polygon.technology)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/moiz2703/Supply-Chain-DAPP.git
cd Supply-Chain-DAPP

# Install root dependencies
npm install

# Compile contract
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Amoy
npx hardhat run scripts/deploy.js --network amoy
```

### Run Frontend

```bash
cd frontend
npm install
npm start
```

Then open `http://localhost:3000` and connect MetaMask on **Polygon Amoy** network.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_metamask_private_key
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

> ⚠ Never share or push your `.env` file.

---

## Usage Flow

1. **Admin** connects wallet (deployer address)
2. **Assign Roles** to other addresses via Assign Role page
3. **Manufacturer** registers a new product
4. **Manufacturer** transfers to Distributor
5. **Distributor** transfers to Retailer
6. **Retailer** transfers to Customer → status becomes `Delivered`
7. Anyone can view the full **Audit Trail** for any product ID

---

## Author

**Abdul** — Blockchain Project | Polygon Amoy Testnet
