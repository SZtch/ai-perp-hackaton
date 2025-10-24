import "@stdlib/deploy";
import "@stdlib/ownable";

// Vault for collateral management
contract Vault with Deployable, Ownable {
    owner: Address;
    totalCollateral: Int = 0;
    userBalances: map<Address, Int>;
    
    init(owner: Address) {
        self.owner = owner;
    }
    
    // Deposit collateral
    receive("deposit") {
        let amount: Int = context().readInt(257);
        require(amount > 0, "Deposit amount must be positive");
        
        self.userBalances[sender()] = (self.userBalances[sender()] ?? 0) + amount;
        self.totalCollateral += amount;
    }
    
    // Withdraw collateral
    receive("withdraw") {
        let amount: Int = context().readInt(257);
        let userBalance: Int = self.userBalances[sender()] ?? 0;
        
        require(amount > 0, "Withdraw amount must be positive");
        require(userBalance >= amount, "Insufficient balance");
        
        self.userBalances[sender()] = userBalance - amount;
        self.totalCollateral -= amount;
        
        // Send TON back to user
        send(SendParameters{
            to: sender(),
            amount: amount,
            mode: SendIgnoreErrors
        });
    }
    
    // Get user balance
    get fun getUserBalance(user: Address): Int {
        return self.userBalances[user] ?? 0;
    }
    
    // Get total collateral
    get fun getTotalCollateral(): Int {
        return self.totalCollateral;
    }
}
