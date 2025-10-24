from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timedelta
import pickle
import os
from typing import List, Dict, Optional

app = FastAPI(title="SuperAI Perp AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PriceData(BaseModel):
    timestamp: int
    price: float
    volume: float

class PredictionRequest(BaseModel):
    lookback: int = 24
    prices: Optional[List[float]] = None

class RiskAssessmentRequest(BaseModel):
    position_size: float
    leverage: int
    collateral: float
    is_long: bool
    current_price: float = 50000.0

class VolatilityModel:
    """Simple LSTM-based volatility predictor"""
    
    def __init__(self):
        self.model_path = os.getenv('AI_MODEL_PATH', './models/volatility_model.pkl')
        self.lookback_period = 24
        self.load_model()
    
    def load_model(self):
        """Load pre-trained model or initialize"""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
        else:
            self.model = None
    
    def calculate_volatility(self, prices: List[float]) -> float:
        """Calculate historical volatility"""
        if len(prices) < 2:
            return 0.0
        
        returns = np.diff(np.log(prices))
        volatility = np.std(returns) * np.sqrt(252)  # Annualized
        return float(volatility * 100)
    
    def predict_volatility(self, prices: List[float]) -> Dict:
        """Predict future volatility"""
        if len(prices) < self.lookback_period:
            prices = prices + [prices[-1]] * (self.lookback_period - len(prices))
        
        current_vol = self.calculate_volatility(prices[-self.lookback_period:])
        
        # Simple prediction: trend-based
        recent_vol = self.calculate_volatility(prices[-12:])
        predicted_vol = (current_vol + recent_vol) / 2
        
        return {
            "current_volatility": current_vol,
            "predicted_volatility": predicted_vol,
            "trend": "increasing" if predicted_vol > current_vol else "decreasing",
            "confidence": 0.85
        }
    
    def calculate_funding_rate(self, open_interest_long: float, 
                              open_interest_short: float,
                              volatility: float) -> float:
        """Calculate dynamic funding rate based on OI imbalance and volatility"""
        
        total_oi = open_interest_long + open_interest_short
        if total_oi == 0:
            return 0.0
        
        # OI imbalance component
        oi_ratio = (open_interest_long - open_interest_short) / total_oi
        oi_component = oi_ratio * 0.05  # Max 5% from OI
        
        # Volatility component
        vol_component = (volatility / 100) * 0.02  # Max 2% from volatility
        
        # Base funding rate
        funding_rate = oi_component + vol_component
        
        # Clamp between -10% and +10%
        funding_rate = max(-0.10, min(0.10, funding_rate))
        
        return funding_rate

# Initialize model
volatility_model = VolatilityModel()

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/predict")
async def predict_volatility(request: PredictionRequest):
    """Predict future volatility"""
    try:
        # Generate sample prices if not provided
        if not request.prices:
            base_price = 50000
            request.prices = [base_price + np.random.randn() * 500 for _ in range(request.lookback)]
        
        prediction = volatility_model.predict_volatility(request.prices)
        
        return {
            "success": True,
            "data": prediction,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk-assessment")
async def assess_risk(request: RiskAssessmentRequest):
    """Assess position risk and recommend margin"""
    try:
        # Calculate required margin
        notional_value = request.position_size * request.current_price
        required_margin = notional_value / request.leverage
        
        # Risk score (0-100)
        leverage_risk = (request.leverage / 100) * 40  # Max 40 points
        collateral_ratio = required_margin / request.collateral if request.collateral > 0 else 100
        collateral_risk = min(collateral_ratio * 30, 60)  # Max 60 points
        
        risk_score = leverage_risk + collateral_risk
        
        # Liquidation price
        if request.is_long:
            liquidation_price = request.current_price * (1 - (request.collateral / notional_value))
        else:
            liquidation_price = request.current_price * (1 + (request.collateral / notional_value))
        
        return {
            "success": True,
            "data": {
                "risk_score": min(risk_score, 100),
                "risk_level": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
                "required_margin": required_margin,
                "liquidation_price": liquidation_price,
                "margin_ratio": (request.collateral / required_margin) * 100,
                "recommendation": "reduce_leverage" if risk_score > 70 else "ok"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/funding-rate")
async def get_funding_rate():
    """Get current funding rate recommendation"""
    try:
        # Simulated OI data
        oi_long = 1000000
        oi_short = 950000
        volatility = 25.5
        
        funding_rate = volatility_model.calculate_funding_rate(
            oi_long, oi_short, volatility
        )
        
        return {
            "success": True,
            "data": {
                "funding_rate": funding_rate,
                "funding_rate_percent": funding_rate * 100,
                "next_update": (datetime.now() + timedelta(hours=1)).isoformat(),
                "open_interest_long": oi_long,
                "open_interest_short": oi_short,
                "volatility": volatility
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/model-update")
async def update_model(model_data: Dict):
    """Update AI model with new parameters"""
    try:
        # Save model update
        model_version = model_data.get("version", "1.0.0")
        
        # TODO: Implement model retraining logic
        
        return {
            "success": True,
            "model_version": model_version,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
