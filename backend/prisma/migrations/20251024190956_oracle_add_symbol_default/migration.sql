-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OracleTick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL DEFAULT 'TONUSDT',
    "price" REAL NOT NULL,
    "volatility" REAL NOT NULL,
    "confidence" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_OracleTick" ("confidence", "createdAt", "id", "price", "timestamp", "volatility") SELECT "confidence", "createdAt", "id", "price", "timestamp", "volatility" FROM "OracleTick";
DROP TABLE "OracleTick";
ALTER TABLE "new_OracleTick" RENAME TO "OracleTick";
CREATE INDEX "OracleTick_symbol_timestamp_idx" ON "OracleTick"("symbol", "timestamp" DESC);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
