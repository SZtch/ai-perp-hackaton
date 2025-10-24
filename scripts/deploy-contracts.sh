#!/bin/bash

echo "Deploying SuperAI Perp Contracts..."

cd contracts

# Build contracts
echo "Building contracts..."
npm run build

# Deploy to TON testnet
echo "Deploying to TON testnet..."
npm run deploy

echo "✓ Contracts deployed successfully!"
