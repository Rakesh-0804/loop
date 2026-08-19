-- Project LOOP - PostgreSQL Database Dump & Schema Definition
-- Database Engine: PostgreSQL (Neon / Standard PG)

CREATE TYPE "Role" AS ENUM ('ADMIN', 'ANALYST', 'VIEWER');
CREATE TYPE "Sentiment" AS ENUM ('POS', 'NEU', 'NEG');
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'ACTIONED');

-- Workspaces Table
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- Users Table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key" UNIQUE ("email"),
    CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Feedbacks Table
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sourceRef" TEXT,
    "customerLabel" TEXT,
    "sentiment" "Sentiment",
    "sentimentScore" DOUBLE PRECISION,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Feedback_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Themes Table
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "workspaceId" TEXT NOT NULL,
    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Theme_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Feedback Themes Join Table
CREATE TABLE "FeedbackTheme" (
    "feedbackId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1,
    CONSTRAINT "FeedbackTheme_pkey" PRIMARY KEY ("feedbackId","themeId"),
    CONSTRAINT "FeedbackTheme_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedbackTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Reports Table
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "contentJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Report_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Initial Workspace & Admin User Inserts
INSERT INTO "Workspace" ("id", "name", "createdAt") VALUES ('cmu001ws0000001', 'Acme SaaS Corp', CURRENT_TIMESTAMP);

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "workspaceId") VALUES 
('cmu001usr000001', 'Alex Mercer (Admin)', 'admin@projectloop.ai', '$2a$10$K9W4W8.0mC9T9X7L8G3Xye0G4P4G.Y/P/6N5V4M3K2J1I0H9G8F7E', 'ADMIN', 'cmu001ws0000001');

INSERT INTO "Theme" ("id", "name", "description", "color", "workspaceId") VALUES
('th-1', 'Performance & Speed', 'System responsiveness and page load speed.', '#3B82F6', 'cmu001ws0000001'),
('th-2', 'UI/UX Usability', 'Navigation clarity and layout responsiveness.', '#8B5CF6', 'cmu001ws0000001'),
('th-3', 'Billing & Subscriptions', 'Invoices, pricing, and payment processing.', '#10B981', 'cmu001ws0000001'),
('th-4', 'Integrations & Webhooks', 'Slack, Zapier, and REST API connectivity.', '#F59E0B', 'cmu001ws0000001'),
('th-5', 'Feature Requests', 'Requested capabilities such as PDF exports and AI summaries.', '#EC4899', 'cmu001ws0000001');
