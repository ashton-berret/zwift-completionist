-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "world" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "distanceMi" REAL NOT NULL,
    "elevationM" REAL NOT NULL,
    "elevationFt" REAL NOT NULL,
    "leadInKm" REAL NOT NULL DEFAULT 0,
    "leadInMi" REAL NOT NULL DEFAULT 0,
    "badgeXp" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL,
    "difficultyScore" INTEGER NOT NULL DEFAULT 1,
    "eventOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CompletedRide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "rideDate" DATETIME NOT NULL,
    "rideTimeMinutes" INTEGER,
    "avgPowerWatts" INTEGER,
    "avgHeartRate" INTEGER,
    "perceivedDifficulty" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompletedRide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompletedRide_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "routeCount" INTEGER NOT NULL,
    "newRoutes" INTEGER NOT NULL,
    "updatedRoutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errors" TEXT,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_key" ON "Route"("name");

-- CreateIndex
CREATE INDEX "CompletedRide_userId_idx" ON "CompletedRide"("userId");

-- CreateIndex
CREATE INDEX "CompletedRide_routeId_idx" ON "CompletedRide"("routeId");

-- CreateIndex
CREATE INDEX "CompletedRide_userId_rideDate_idx" ON "CompletedRide"("userId", "rideDate");
