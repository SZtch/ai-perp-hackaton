/*
  Warnings:

  - You are about to drop the column `createdAt` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `entryPx` on the `positions` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryPrice` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leverage` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `liquidationPrice` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `margin` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `side` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `positions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "usdtBalance" REAL NOT NULL DEFAULT 0,
    "lockedMargin" REAL NOT NULL DEFAULT 0,
    "totalDeposit" REAL NOT NULL DEFAULT 0,
    "totalWithdraw" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "balanceAfter" REAL NOT NULL,
    "relatedId" TEXT,
    "txHash" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TradingPair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "baseAsset" TEXT NOT NULL,
    "quoteAsset" TEXT NOT NULL,
    "minOrderSize" REAL NOT NULL DEFAULT 1,
    "maxOrderSize" REAL NOT NULL DEFAULT 1000000,
    "maxLeverage" INTEGER NOT NULL DEFAULT 20,
    "takerFee" REAL NOT NULL DEFAULT 0.001,
    "makerFee" REAL NOT NULL DEFAULT 0.0005,
    "maintenanceMargin" REAL NOT NULL DEFAULT 0.05,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OracleTick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "symbol" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "volatility" REAL NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_OracleTick" ("confidence", "createdAt", "id", "price", "symbol", "timestamp", "volatility") SELECT "confidence", "createdAt", "id", "price", "symbol", "timestamp", "volatility" FROM "OracleTick";
DROP TABLE "OracleTick";
ALTER TABLE "new_OracleTick" RENAME TO "OracleTick";
CREATE INDEX "OracleTick_symbol_timestamp_idx" ON "OracleTick"("symbol", "timestamp" DESC);
CREATE INDEX "OracleTick_createdAt_idx" ON "OracleTick"("createdAt" DESC);
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tonAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id", "tonAddress") SELECT "createdAt", "id", "tonAddress" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_tonAddress_key" ON "User"("tonAddress");
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" REAL,
    "qty" REAL NOT NULL,
    "leverage" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'open',
    "fillPrice" REAL,
    "fee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filledAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "filledAt", "id", "price", "qty", "side", "status", "symbol", "type", "userId") SELECT "createdAt", "filledAt", "id", "price", "qty", "side", "status", "symbol", "type", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE INDEX "orders_userId_createdAt_idx" ON "orders"("userId", "createdAt" DESC);
CREATE INDEX "orders_symbol_status_idx" ON "orders"("symbol", "status");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE TABLE "new_positions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "leverage" INTEGER NOT NULL,
    "entryPrice" REAL NOT NULL,
    "margin" REAL NOT NULL,
    "liquidationPrice" REAL NOT NULL,
    "realizedPnl" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "positions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_positions" ("id", "size", "symbol", "userId") SELECT "id", "size", "symbol", "userId" FROM "positions";
DROP TABLE "positions";
ALTER TABLE "new_positions" RENAME TO "positions";
CREATE INDEX "positions_userId_status_idx" ON "positions"("userId", "status");
CREATE INDEX "positions_symbol_status_idx" ON "positions"("symbol", "status");
CREATE UNIQUE INDEX "positions_userId_symbol_status_key" ON "positions"("userId", "symbol", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "TradingPair_symbol_key" ON "TradingPair"("symbol");

-- CreateIndex
CREATE INDEX "TradingPair_symbol_idx" ON "TradingPair"("symbol");

-- CreateIndex
CREATE INDEX "TradingPair_isActive_idx" ON "TradingPair"("isActive");

-- CreateIndex
CREATE INDEX "TonProofNonce_payload_idx" ON "TonProofNonce"("payload");
