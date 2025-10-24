# SuperAI Perp - Perpetual DEX with AI Risk Management

A full-stack decentralized perpetual futures exchange on TON blockchain with AI-powered dynamic margin and funding rate management.

## Architecture

\`\`\`
SuperAI Perp
├── Frontend (Telegram Mini App + Web Dashboard)
│   ├── React + Next.js 14
│   ├── TonConnect Integration
│   └── Real-time Trading UI
├── Smart Contracts (Tact)
│   ├── OracleRegistry
│   ├── Vault
│   ├── PerpEngine
│   ├── RiskManager
│   └── FundingManager
├── Backend (Node.js + Express)
│   ├── Oracle Report Service
│   ├── AI Integration Layer
│   └── Keeper Service
└── AI Layer (Python/FastAPI)
    ├── Volatility Prediction (LSTM)
    ├── Risk Assessment
    └── Funding Rate Calculation
\`\`\`

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- TON CLI

### Setup

1. Clone and install dependencies:
\`\`\`bash
git clone <repo>
cd superai-perp
npm run setup
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env
# Edit .env with your values
\`\`\`

3. Start services:
\`\`\`bash
# Terminal 1: Database & IPFS
docker-compose up

# Terminal 2: Frontend & Backend
npm run dev

# Terminal 3: AI Service
npm run ai:start
\`\`\`

4. Deploy contracts:
\`\`\`bash
npm run contracts:deploy
\`\`\`

## Features

- **Perpetual Trading**: Open/close positions with leverage
- **AI Risk Management**: Dynamic margin requirements
- **Dynamic Funding Rates**: AI-adjusted based on market conditions
- **Telegram Mini App**: Trade directly from Telegram
- **DePIN Oracle Integration**: Decentralized price feeds via PinGo
- **Real-time PnL**: Live profit/loss tracking

## Project Structure

- `/frontend` - Telegram Mini App & Web Dashboard
- `/backend` - Node.js API Server
- `/contracts` - Tact Smart Contracts
- `/ai` - Python FastAPI AI Service
- `/docs` - Documentation & Guides

## License

MIT
\`\`\`

---

## 🔗 SMART CONTRACTS (Tact)

```tact file="contracts/src/oracle-registry.tact"
import "@stdlib/deploy";
import "@stdlib/ownable";

// Oracle data structure
struct OracleData {
    price: Int;
    timestamp: Int;
    volatility: Int;
    confidence: Int;
}

// Oracle Registry Contract
contract OracleRegistry with Deployable, Ownable {
    owner: Address;
    oracles: map<Address, OracleData>;
    priceHistory: map<Int, Int>; // timestamp -> price
    
    init(owner: Address) {
        self.owner = owner;
    }
    
    // Register new oracle
    receive("register_oracle") {
        require(sender() == self.owner, "Only owner can register oracles");
    }
    
    // Submit price data
    receive("submit_price") {
        let ctx: Context = context();
        let price: Int = ctx.readInt(257);
        let volatility: Int = ctx.readInt(257);
        let confidence: Int = ctx.readInt(257);
        
        self.oracles[sender()] = OracleData{
            price: price,
            timestamp: now(),
            volatility: volatility,
            confidence: confidence
        };
        
        self.priceHistory[now()] = price;
    }
    
    // Get latest price
    get fun getLatestPrice(): Int {
        let maxConfidence: Int = 0;
        let bestPrice: Int = 0;
        
        let oracleAddresses: map<Address, OracleData> = self.oracles;
        // Iterate through oracles and find best price
        
        return bestPrice;
    }
    
    // Get volatility
    get fun getVolatility(): Int {
        let maxConfidence: Int = 0;
        let bestVolatility: Int = 0;
        
        // Calculate weighted volatility
        
        return bestVolatility;
    }
}
