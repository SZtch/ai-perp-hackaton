# SuperAI Perp Architecture

## System Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App                         │
│              (React + Next.js + TonConnect)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API                                │
│              (Node.js + Express)                             │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Oracle API   │ Trading API  │ Keeper API   │             │
│  └──────────────┴──────────────┴──────────────┘             │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ TON    │  │ AI     │  │ Database │
    │Blockchain│ │Service │  │PostgreSQL│
    └────────┘  └────────┘  └──────────┘
\`\`\`

## Component Details

### Frontend (Telegram Mini App)
- **Framework**: React + Next.js 14
- **Wallet**: TonConnect
- **State Management**: React Hooks + SWR
- **Styling**: Tailwind CSS

### Smart Contracts (Tact)
- **OracleRegistry**: Price feed management
- **Vault**: Collateral management
- **PerpEngine**: Trading engine
- **RiskManager**: Risk assessment
- **FundingManager**: Funding rate calculation

### Backend API
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: Signature verification

### AI Service
- **Framework**: FastAPI
- **ML**: scikit-learn, TensorFlow
- **Models**: Volatility prediction, Risk assessment

## Data Flow

### Opening a Position
1. User submits position form in Mini App
2. Frontend calls AI risk assessment API
3. Backend validates position parameters
4. Smart contract creates position
5. Position stored in database
6. Real-time updates via WebSocket

### Funding Rate Update
1. AI service calculates new funding rate
2. Backend publishes update
3. Smart contract updates funding rate
4. Positions settled with new rate
5. Users notified of changes

## Security

- **Signature Verification**: All transactions signed by user wallet
- **Rate Limiting**: API endpoints rate-limited
- **Input Validation**: All inputs validated server-side
- **RLS**: Row-level security on database
- **CORS**: Restricted to trusted origins

## Scalability

- **Horizontal Scaling**: Stateless backend services
- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries
- **CDN**: Static assets served via CDN
- **Load Balancing**: Multiple backend instances
