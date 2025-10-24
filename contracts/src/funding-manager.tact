import "@stdlib/deploy";
import "@stdlib/ownable";

// Funding rate structure
struct FundingRate {
    rate: Int;
    timestamp: Int;
    nextUpdateTime: Int;
}

// Funding Manager Contract
contract FundingManager with Deployable, Ownable {
    owner: Address;
    currentFundingRate: FundingRate;
    fundingHistory: map<Int, Int>; // timestamp -> rate
    accumulatedFunding: map<Address, Int>;
    
    init(owner: Address) {
        self.owner = owner;
        self.currentFundingRate = FundingRate{
            rate: 0,
            timestamp: now(),
            nextUpdateTime: now() + 3600 // 1 hour
        };
    }
    
    // Update funding rate (called by AI service)
    receive("update_funding_rate") {
        require(sender() == self.owner, "Only owner can update");
        
        let ctx: Context = context();
        let newRate: Int = ctx.readInt(257);
        
        self.fundingHistory[now()] = newRate;
        self.currentFundingRate = FundingRate{
            rate: newRate,
            timestamp: now(),
            nextUpdateTime: now() + 3600
        };
    }
    
    // Calculate funding payment
    get fun calculateFundingPayment(positionSize: Int, isLong: Bool): Int {
        let rate: Int = self.currentFundingRate.rate;
        let payment: Int = (positionSize * rate) / 1000000;
        
        if (!isLong) {
            payment = -payment;
        }
        
        return payment;
    }
    
    // Get current funding rate
    get fun getCurrentFundingRate(): FundingRate {
        return self.currentFundingRate;
    }
}
