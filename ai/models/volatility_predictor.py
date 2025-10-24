import numpy as np
from typing import List, Tuple
from sklearn.preprocessing import StandardScaler
import pickle

class VolatilityPredictor:
    """Advanced volatility prediction model"""
    
    def __init__(self, lookback_period: int = 24):
        self.lookback_period = lookback_period
        self.scaler = StandardScaler()
        self.model = None
    
    def calculate_returns(self, prices: List[float]) -> np.ndarray:
        """Calculate log returns"""
        prices_array = np.array(prices)
        returns = np.diff(np.log(prices_array))
        return returns
    
    def calculate_volatility(self, prices: List[float], window: int = 20) -> float:
        """Calculate rolling volatility"""
        returns = self.calculate_returns(prices)
        if len(returns) < window:
            return np.std(returns) * np.sqrt(252)
        
        volatility = np.std(returns[-window:]) * np.sqrt(252)
        return float(volatility * 100)
    
    def extract_features(self, prices: List[float]) -> np.ndarray:
        """Extract features for prediction"""
        returns = self.calculate_returns(prices)
        
        features = []
        # Volatility
        features.append(np.std(returns) * np.sqrt(252))
        # Skewness
        features.append(self._calculate_skewness(returns))
        # Kurtosis
        features.append(self._calculate_kurtosis(returns))
        # Mean reversion
        features.append(np.mean(returns))
        
        return np.array(features).reshape(1, -1)
    
    def _calculate_skewness(self, returns: np.ndarray) -> float:
        """Calculate skewness of returns"""
        mean = np.mean(returns)
        std = np.std(returns)
        if std == 0:
            return 0
        return np.mean(((returns - mean) / std) ** 3)
    
    def _calculate_kurtosis(self, returns: np.ndarray) -> float:
        """Calculate kurtosis of returns"""
        mean = np.mean(returns)
        std = np.std(returns)
        if std == 0:
            return 0
        return np.mean(((returns - mean) / std) ** 4) - 3
    
    def predict(self, prices: List[float]) -> Tuple[float, float]:
        """Predict future volatility"""
        current_vol = self.calculate_volatility(prices)
        
        # Simple trend-based prediction
        recent_vol = self.calculate_volatility(prices[-12:]) if len(prices) >= 12 else current_vol
        predicted_vol = (current_vol * 0.7 + recent_vol * 0.3)
        
        return current_vol, predicted_vol
    
    def save_model(self, path: str):
        """Save model to disk"""
        with open(path, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load_model(path: str):
        """Load model from disk"""
        with open(path, 'rb') as f:
            return pickle.load(f)
