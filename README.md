# 🌟 Veridion - Universal Product Supply Chain Platform

> **Status:** ✅ Production Ready  
> **Tagline:** Trust the Origin. Track the Journey.  
> **Tech Stack:** Next.js 14, PostgreSQL, Ethereum, TypeScript

A production-grade, tamper-proof universal supply chain tracking and verification platform powered by blockchain technology. Veridion is designed to be industry-agnostic, tracking everything from electronics and pharmaceuticals to luxury goods and food products. It features advanced anti-counterfeit detection, trust scoring, and real-time analytics.

## 🎯 Key Features

✅ **Industry-Agnostic Tracking** - Works for any product type, category, or industry  
✅ **Missing Link Detection** - Automatically identifies skipped supply chain steps  
✅ **Trust Score Engine** - 0-100 scoring algorithm for product batch authenticity  
✅ **Bulk Verification** - CSV upload for verifying hundreds of batches at once  
✅ **Analytics Dashboard** - Real-time metrics and producer rankings  
✅ **Dark Theme** - Modern, premium UI across all pages  
✅ **Dynamic QR Codes** - Scan tracking with duplicate detection  
✅ **PostgreSQL Database** - Self-hosted with connection pooling and JWT auth  
✅ **Blockchain Verification** - Immutable history of product origin and ownership transfers

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (local installation)
- MetaMask browser extension (optional, for blockchain interactions)
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd New

# Install dependencies
npm install

# Compile smart contract
npx hardhat compile

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

1. **Create `.env.local`** file (copy from `.env.example`):
```env
# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veridion
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc...
PRIVATE_KEY=your_private_key
```

2. **Set up PostgreSQL Database:**
   ```bash
   # Create the database
   createdb veridion

   # Run the schema migration (includes dummy data for multiple industries)
   psql -d veridion -f config/schema.sql
   ```
   This creates 5 tables: `users`, `batches`, `transfers`, `scans`, `analytics`

### Running the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Advanced Features

### Missing Link Detection Engine
- **Automatic Detection**: Identifies skipped supply chain steps
- **Visual Warnings**: Red badges for suspicious batches
- **Detailed Explanations**: Shows which role is missing (Manufacturer/Logistics/Vendor)
- **Trust Score Impact**: Reduces score for incomplete supply chains

### Dynamic QR Codes
- **Scan Tracking**: Records every QR code scan with timestamp
- **Duplicate Detection**: Flags multiple scans from same location
- **Geo-Location**: Tracks scan locations for fraud detection

### Bulk Verification
- **CSV Upload**: Verify hundreds of product batches at once
- **Comprehensive Reports**: Genuine, Suspicious, Expired, Counterfeit breakdown
- **Downloadable Results**: Export verification reports in CSV format

### Trust Score Engine (0-100)
**Scoring Algorithm:**
- Supply Chain Completeness: 40 points
- Timing Consistency: 20 points
- Geo/Location anomalies: 20 points
- Scan anomalies: 20 points
- **Penalties**: -10 per QR reuse

**Color-Coded Badges:**
- 🟢 Green (80-100): Trusted
- 🟡 Yellow (50-79): Caution
- 🔴 Red (0-49): High Risk

### Analytics Dashboard
- **Real-time Metrics**: Total batches, genuine rate, flagged batches
- **Event Tracking**: Counterfeit attempts, missing links, duplicate scans
- **Producer Rankings**: Trust scores by manufacturer
- **Security Events**: Recent suspicious activities

## 📊 Database Schema

The platform uses **PostgreSQL** with 5 core tables:

1. **users**: User accounts, companies, and roles
2. **batches**: Generic product batch information (product_name, category, sku, location)
3. **transfers**: Supply chain transfers with chain-of-custody tracking
4. **scans**: QR code scan history and IP logging
5. **analytics**: Security and system event tracking

See `config/schema.sql` for the complete schema and dummy data injection.

## 🔐 Authentication

Authentication uses **JWT (JSON Web Tokens)** with **bcrypt** password hashing:

- **Register**: `POST /api/auth/register` — creates user with hashed password, returns JWT
- **Login**: `POST /api/auth/login` — validates credentials, returns JWT
- Tokens are stored in `localStorage`
- Auth middleware available at `middleware/auth.ts` for protecting API routes

## 📋 Smart Contract

The core verification logic spans across an Ethereum smart contract and the database layer. 

### Deploy to Sepolia Testnet

1. Create `.env` file with `SEPOLIA_RPC_URL` and `PRIVATE_KEY`.
2. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 👥 Supply Chain Roles

The system supports specialized workflows for the following roles:
1. **Manufacturer / Producer**: Creates product batches and assigns initial tracking data.
2. **Distributor / Logistics Partner**: Handles complex logistics, shipping, and routing.
3. **Vendor / Seller**: Receives the products, making them available to end consumers.
4. **Consumer**: Final recipient who scans the QR code to verify product authenticity and journey.
5. **Admin / System Manager**: Manages platform operations and roles.
6. **Bulk Verifier**: Special role for enterprises that need to verify deliveries en masse.
