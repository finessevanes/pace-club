# Pace Club

Pace Club is a web3 social app for women runners to find, connect, and build community with others who match their pace and vibe. It uses on-chain profiles, real-world activity verification, and privacy-preserving identity checks.

## Tech Stack
- **Frontend:** Next.js, React, TailwindCSS
- **Smart Contracts:** Solidity (deployed on Celo and Flow EVM testnet)
- **Web3 Libraries:** ethers.js, @privy-io/react-auth, Self Protocol SDKs
- **Backend:** Node.js/Express (for Strava OAuth and web2 attestation)
- **Other:** Strava API for activity verification

## Key Features

### Self Protocol for Gender Verification
Users must verify their gender as female using the Self protocol, which leverages zero-knowledge proofs to keep sensitive data private. This is enforced both in the UI and on-chain (see `ProofOfHuman.sol`).

### On-Chain Profiles on Flow
User running profiles (pace, vibe, location, bio) are written to the Flow EVM testnet via the `VibeProfile` contract. This enables decentralized, tamper-proof social data and rewards for real-world meetups.

### Strava Integration
Users connect their Strava account. The app fetches and verifies running activities, which are used as proof for real-world meetups and to claim on-chain rewards.

### Honorable Mention – Flare
The project explored using Flare for web2 data attestation, but due to local development URLs not being publicly accessible, this integration could not be deployed in time.

## Contract Addresses & Network Info

- **Celo Alfajores Testnet**
  - ProofOfHuman Contract: `0x3E28d39Bee8366502d8eA3327a13f9f35Fa788dd`
  - RPC URL: `https://alfajores-forno.celo-testnet.org`

- **Flow EVM Testnet**
  - VibeProfile Contract: `0xdD47730499629F23Bf1b9dEC03C73Cc502d3012C`
  - RPC URL: `https://testnet.evm.nodes.onflow.org`

- **Self Protocol**
  - App Name: "Pace Club"
  - Scope: "pace-club"

(See `.env.local` for full environment configuration.)
