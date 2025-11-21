⚡️ Aether — The Decentralized API Marketplace

"Kill the subscription. Pay per call."

(Note: Upload a screenshot of your landing page here)

💡 Overview

Aether is a decentralized Function-as-a-Service (FaaS) marketplace built on the Hedera Network.

It solves the "SaaS Subscription Fatigue" problem by allowing developers to publish API functions (like AI text summarizers or image generators) and get paid instantly in HBAR for every single execution. Users pay only for what they use—down to a fraction of a cent—without monthly fees or sign-ups.

Built for: Hedera Hello Future: Ascension Hackathon 2025 Track: Open Track Category: Web3 Economy • FaaS • Micropayments

🧠 The Problem

The current software economy is broken for both users and developers:

💸 Subscription Fatigue: Users are tired of paying $20/month for tools they only use twice.

🚧 Monetization Barriers: Developers struggle to monetize simple, useful APIs because building a billing system (Stripe, user accounts) takes months.

🔒 Centralization: API access is controlled by gatekeepers who can de-platform developers or hike prices arbitrarily.

🚀 The Solution

Aether creates a trustless, pay-per-call economy powered by Hedera's unique speed and low fees.

⚡️ How It Works (The "Atomic" Flow)

We utilize a unique Decoupled Pub/Sub Architecture using the Hedera Consensus Service (HCS) as a high-speed job queue.

Step

Description

1. Discover

User browses the marketplace and selects a function (e.g., "AI Image Gen" for 10 HBAR).

2. Atomic Order

The frontend builds a single atomic transaction containing: 



 1️⃣ A Crypto Transfer of 10 HBAR to the Developer.



 2️⃣ An HCS Message with the job payload (input data) sent to the "Job Topic."

3. Verification

The Aether Gateway (Backend) listens to the Job Topic. It queries the Mirror Node to verify that the payment transaction linked to the job was successful.

4. Execution

Once verified, the Gateway executes the function (or proxies it to the developer's external API).

5. Delivery

The result is posted back to a separate HCS Receipt Topic, which the user's frontend is listening to in real-time.

🧩 Tech Stack

Layer

Technology

Purpose

Frontend

React + TailwindCSS

User Marketplace & Developer Portal

Wallet

HashPack / WalletConnect

Secure transaction signing

Backend

Node.js + Express

The "Gateway" that listens to HCS & executes jobs

Database

MongoDB (Atlas)

Stores function metadata (pricing, topic IDs)

Blockchain

Hedera HCS

Decentralized Job Queue & Audit Log

Payments

Hedera Crypto

Native HBAR micropayments

SDK

@hashgraph/sdk

interacting with Hedera services

🧱 Folder Structure

aether-backend/ (The Gateway)

This Node.js server acts as the trustless bridge between the HCS Job Topic and the API functions.

aether-backend/
├── config/
│   └── db.js                 # MongoDB connection logic
├── models/
│   └── apiFunctionModel.js  # Schema for registered functions (price, topics, provider ID)
├── routes/
│   └── apiRoutes.js    # API endpoints (GET /functions, POST /functions)
├── controllers/
│   └── apiController.js# Logic to fetch marketplace listings
├── services/
│   ├── hcsListener.service.js  # THE CORE: Listens 24/7 to HCS Job Topics
│   ├── hcsSubmitter.service.js # THE COURIER: Posts results to HCS Receipt Topics
│   └── functionExecutor.js     # THE ROUTER: Routes jobs to internal mocks or external APIs
├── createTopics.js             # One-time script to provision HCS topics
└── index.js                   # Entry point


aether-frontend/ (The Marketplace)

A modern React application where users browse, pay, and consume APIs.

aether-frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx        # Global navigation & wallet status
│   ├── context/
│   │   └── WalletProvider.jsx # Manages HashPack connection & signing
│   ├── App.jsx               # Main application logic (Marketplace & Checkout)
│   └── main.jsx              # Entry point
└── tailwind.config.js        # Styling configuration


🧰 Installation & Setup

Prerequisites

Node.js v18+

A Hedera Testnet Account (from portal.hedera.com)

A MongoDB Atlas connection string

1. Backend Setup

cd aether-backend
npm install

# Create a .env file with:
# OPERATOR_ID=...
# OPERATOR_KEY=...
# MONGO_URI=...

# Run the setup script once to create HCS Topics
npm run setup 

# Start the Gateway
npm run dev


2. Frontend Setup

cd aether-frontend
npm install

# Start the React App
npm run dev


🧠 Why Hedera? (The "Impossible" Edge)

Aether is only possible on Hedera.

Micropayments: On Ethereum, a $0.01 API call would cost $50 in gas. On Hedera, it costs **$0.0001**.

Speed: HCS provides fair ordering and timestamps in 3-5 seconds, making the "Job Queue" feel instant.

Auditability: Every job request and every result is permanently logged on HCS, creating a trustless history of service delivery.

🔮 Future Roadmap

Phase 1 (Hackathon MVP): Centralized Gateway running on Render.com.

Phase 2 (Q1 2026): "Aether Node" SDK. Allow developers to run their own listener nodes, decentralizing the execution layer.

Phase 3 (Q3 2026): Aether DAO. Governance token to vote on platform fees and disputes.

🏆 Hackathon Details

Event: Hedera Hello Future: Ascension 2025

Track: Open Track

Network: Hedera Testnet

Live Demo: https://aether-gilt-delta.vercel.app/

Video Demo: https://youtu.be/gKeKUh1oWaI

🧑‍💻 Team
Aether

Name: Praise Precious

Role: Team Lead



Full Stack Developer & Lead Architect

Aether — The future of software is pay-per-call. ⚡️
