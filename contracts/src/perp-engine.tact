import "@stdlib/deploy";
import "@stdlib/ownable";

// Position structure
struct Position {
    user: Address;
    size: Int;
    entryPrice: Int;
    leverage: Int;
    collateral: Int;
    isLong: Bool;
    openedAt: Int;
}

// Perpetual Engine Contract
contract PerpEngine with Deployable, Ownable {
    owner: Address;
    positions: map<Int, Position>; // positionId -> Position
    nextPositionId: Int = 0;
    totalOpenInterest: Int = 0;
    
    init(owner: Address) {
        self.owner = owner;
    }
    
    // Open position
    receive("open_position") {
        let ctx: Context = context();
        let size: Int = ctx.readInt(257);
        let leverage: Int = ctx.readInt(257);
        let isLong: Bool = ctx.readInt(1) == 1;
        let collateral: Int = ctx.readInt(257);
        
        require(size > 0, "Size must be positive");
        require(leverage > 0 && leverage <= 100, "Invalid leverage");
        require(collateral > 0, "Collateral must be positive");
        
        let positionId: Int = self.nextPositionId;
        self.nextPositionId += 1;
        
        self.positions[positionId] = Position{
            user: sender(),
            size: size,
            entryPrice: 0, // Will be set by oracle
            leverage: leverage,
            collateral: collateral,
            isLong: isLong,
            openedAt: now()
        };
        
        self.totalOpenInterest += size;
    }
    
    // Close position
    receive("close_position") {
        let ctx: Context = context();
        let positionId: Int = ctx.readInt(257);
        
        let position: Position? = self.positions[positionId];
        require(position != null, "Position not found");
        require(position!!.user == sender(), "Not position owner");
        
        self.totalOpenInterest -= position!!.size;
        self.positions[positionId] = null;
    }
    
    // Get position
    get fun getPosition(positionId: Int): Position? {
        return self.positions[positionId];
    }
    
    // Get total open interest
    get fun getTotalOpenInterest(): Int {
        return self.totalOpenInterest;
    }
}
