#!/bin/bash

echo "🚀 SuperAI Perp Setup Script"
echo "=============================="

# Check prerequisites
echo "Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js is required"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required"; exit 1; }

# Setup environment
echo "Setting up environment..."
cp .env.example .env
echo "✓ .env file created (please update with your values)"

# Install dependencies
echo "Installing dependencies..."
npm install
npm run setup

# Start services
echo "Starting services..."
docker-compose up -d

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your TON wallet and API keys"
echo "2. Run: npm run dev (Terminal 1)"
echo "3. Run: npm run ai:start (Terminal 2)"
echo "4. Run: npm run contracts:deploy (Terminal 3)"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "AI Service: http://localhost:8001"
