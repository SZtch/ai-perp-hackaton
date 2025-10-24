from typing import Dict

class RiskCalculator:
    """Calculate risk metrics for positions"""
    
    @staticmethod
    def calculate_liquidation_price(
        entry_price: float,
        leverage: int,
        collateral: float,
        position_size: float,
        is_long: bool
    ) -> float:
        """Calculate liquidation price"""
        notional = position_size * entry_price
        maintenance_margin = notional / (leverage * 2)
        
        if is_long:
            liquidation_price = entry_price - (maintenance_margin / position_size)
        else:
            liquidation_price = entry_price + (maintenance_margin / position_size)
        
        return max(0, liquidation_price)
    
    @staticmethod
    def calculate_risk_score(
        leverage: int,
        collateral: float,
        position_size: float,
        current_price: float,
        volatility: float
    ) -> float:
        """Calculate overall risk score (0-100)"""
        notional = position_size * current_price
        
        # Leverage risk (0-40)
        leverage_risk = (leverage / 100) * 40
        
        # Collateral ratio risk (0-30)
        required_margin = notional / leverage
        collateral_ratio = collateral / required_margin if required_margin > 0 else 0
        collateral_risk = max(0, (1 - collateral_ratio) * 30)
        
        # Volatility risk (0-30)
        volatility_risk = min(volatility / 100 * 30, 30)
        
        total_risk = leverage_risk + collateral_risk + volatility_risk
        return min(total_risk, 100)
    
    @staticmethod
    def get_risk_level(risk_score: float) -> str:
        """Get risk level from score"""
        if risk_score < 30:
            return "low"
        elif risk_score < 60:
            return "medium"
        else:
            return "high"
    
    @staticmethod
    def calculate_margin_requirement(
        position_size: float,
        current_price: float,
        leverage: int,
        volatility: float
    ) -> float:
        """Calculate dynamic margin requirement based on volatility"""
        notional = position_size * current_price
        base_margin = notional / leverage
        
        # Adjust for volatility
        volatility_multiplier = 1 + (volatility / 100) * 0.5
        
        return base_margin * volatility_multiplier
