/*
  Warnings:

  - You are about to drop the column `otpAttempts` on the `Member` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "channelId" TEXT NOT NULL,
    "kickDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uniqueToken" TEXT,
    "inviteLink" TEXT,
    "hasJoined" BOOLEAN NOT NULL DEFAULT false,
    "tokenUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Member_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("channelId", "createdAt", "firstName", "hasJoined", "id", "inviteLink", "isActive", "kickDate", "lastName", "telegramId", "tokenUsed", "uniqueToken", "username") SELECT "channelId", "createdAt", "firstName", "hasJoined", "id", "inviteLink", "isActive", "kickDate", "lastName", "telegramId", "tokenUsed", "uniqueToken", "username" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
