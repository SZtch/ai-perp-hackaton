# SuperAI Perp Deployment Guide

## Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- TON CLI
- Git

## Local Development Setup

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd superai-perp
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm run setup
\`\`\`

### 3. Configure Environment
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

### 4. Start Services

**Terminal 1: Database & IPFS**
\`\`\`bash
docker-compose up
\`\`\`

**Terminal 2: Frontend & Backend**
\`\`\`bash
npm run dev
\`\`\`

**Terminal 3: AI Service**
\`\`\`bash
npm run ai:start
\`\`\`

**Terminal 4: Deploy Contracts**
\`\`\`bash
npm run contracts:deploy
\`\`\`

## TON Testnet Configuration

### Get Testnet TON

1. Visit https://testnet.toncenter.com
2. Request testnet TON tokens
3. Update MNEMONIC in .env

### Deploy Contracts

\`\`\`bash
npm run contracts:deploy
\`\`\`

This will:
1. Compile Tact contracts
2. Deploy to TON testnet
3. Update contract addresses in .env

## Production Deployment

### 1. Build for Production
\`\`\`bash
npm run build
\`\`\`

### 2. Deploy to Vercel (Frontend)
\`\`\`bash
vercel deploy --prod
\`\`\`

### 3. Deploy Backend to Cloud
\`\`\`bash
# Using Railway, Render, or similar
npm run build
npm start
\`\`\`

### 4. Deploy AI Service
\`\`\`bash
# Using Docker
docker build -t superai-perp-ai ./ai
docker push <registry>/superai-perp-ai
\`\`\`

### 5. Deploy Contracts to Mainnet
\`\`\`bash
TON_NETWORK=mainnet npm run contracts:deploy
\`\`\`

## Monitoring

### Logs
\`\`\`bash
# Backend logs
tail -f backend/logs/app.log

# AI service logs
tail -f ai/logs/service.log
\`\`\`

### Health Checks
\`\`\`bash
curl http://localhost:3001/health
curl http://localhost:8001/health
\`\`\`

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: \`docker-compose ps\`
- Check DATABASE_URL in .env

### TON Connection Error
- Verify TON_RPC_URL is correct
- Check TON_API_KEY is valid

### AI Service Not Responding
- Ensure Python 3.9+ is installed
- Check AI_SERVICE_URL in .env
- Verify FastAPI is running: \`curl http://localhost:8001/health\`

## Security Considerations

1. Never commit .env files
2. Use strong wallet mnemonics
3. Enable rate limiting in production
4. Implement proper authentication
5. Use HTTPS for all endpoints
6. Regularly update dependencies
