import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  console.log('Seeding Project LOOP database...');

  // Clean existing data
  await prisma.feedbackTheme.deleteMany();
  await prisma.embedding.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme SaaS Corp',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Mercer (Admin)',
      email: 'admin@projectloop.ai',
      passwordHash,
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: 'Sarah Chen (Analyst)',
      email: 'analyst@projectloop.ai',
      passwordHash,
      role: 'ANALYST',
      workspaceId: workspace.id,
    },
  });

  await prisma.user.create({
    data: {
      name: 'David Miller (Viewer)',
      email: 'viewer@projectloop.ai',
      passwordHash,
      role: 'VIEWER',
      workspaceId: workspace.id,
    },
  });

  // Create Themes
  const themePerf = await prisma.theme.create({
    data: {
      name: 'Performance & Speed',
      description: 'System responsiveness, dashboard page load times, and query latency.',
      color: '#3B82F6', // Blue
      workspaceId: workspace.id,
    },
  });

  const themeUI = await prisma.theme.create({
    data: {
      name: 'UI/UX Usability',
      description: 'Navigation clarity, mobile layout responsiveness, and design aesthetics.',
      color: '#8B5CF6', // Purple
      workspaceId: workspace.id,
    },
  });

  const themeBilling = await prisma.theme.create({
    data: {
      name: 'Billing & Subscriptions',
      description: 'Pricing plans, invoice clarity, payment processing, and seat upgrades.',
      color: '#10B981', // Emerald
      workspaceId: workspace.id,
    },
  });

  const themeIntegrations = await prisma.theme.create({
    data: {
      name: 'Integrations & Webhooks',
      description: 'Slack, Zapier, HubSpot, and REST API connectivity.',
      color: '#F59E0B', // Amber
      workspaceId: workspace.id,
    },
  });

  const themeFeatures = await prisma.theme.create({
    data: {
      name: 'Feature Requests',
      description: 'Requested capabilities such as PDF exports, AI summaries, and custom tags.',
      color: '#EC4899', // Pink
      workspaceId: workspace.id,
    },
  });

  // Create Sample Feedback Items
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const sampleFeedbacks = [
    // --- Support Tickets (mostly negative) ---
    {
      content: 'Billing invoice failed to generate the tax breakdown item. Customer support took 3 days to reply to our ticket.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #4812',
      customerLabel: 'Finance Director - Apex Global',
      sentiment: 'NEG' as const,
      sentimentScore: 0.12,
      status: 'NEW' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(2),
    },
    {
      content: 'Exporting large CSV files with 50,000+ rows times out occasionally during peak hours.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5092',
      customerLabel: 'Data Ops Manager',
      sentiment: 'NEG' as const,
      sentimentScore: 0.21,
      status: 'NEW' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(3),
    },
    {
      content: 'Our account was double-charged this month and the refund process has been a nightmare to get through.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5247',
      customerLabel: 'Ops Lead - Northwind',
      sentiment: 'NEG' as const,
      sentimentScore: 0.08,
      status: 'REVIEWED' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(4),
    },
    {
      content: 'I have been waiting 5 days for a response on our priority ticket. This is unacceptable for an enterprise plan.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5310',
      customerLabel: 'IT Director - TechFlow',
      sentiment: 'NEG' as const,
      sentimentScore: 0.09,
      status: 'NEW' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(5),
    },
    {
      content: 'The web app keeps crashing every time we try to load the analytics dashboard with more than 10 users.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5378',
      customerLabel: 'Team Admin - InnoSoft',
      sentiment: 'NEG' as const,
      sentimentScore: 0.1,
      status: 'NEW' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(7),
    },
    {
      content: 'Invoice PDF shows incorrect VAT amounts and we cannot reconcile our accounts at the end of the quarter.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5421',
      customerLabel: 'CFO - Apex Global',
      sentiment: 'NEG' as const,
      sentimentScore: 0.11,
      status: 'REVIEWED' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(9),
    },
    {
      content: 'Search queries on large datasets take forever and frequently return incorrect results during the week.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5490',
      customerLabel: 'Data Analyst - CloudNine',
      sentiment: 'NEG' as const,
      sentimentScore: 0.18,
      status: 'NEW' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(12),
    },
    {
      content: 'Support agent was unhelpful and closed our ticket without ever resolving the underlying issue.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5512',
      customerLabel: 'Support Lead - BetaWorks',
      sentiment: 'NEG' as const,
      sentimentScore: 0.14,
      status: 'REVIEWED' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(15),
    },
    {
      content: 'Payment failed three times even though our card is valid. No notification arrived until the account was locked.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5584',
      customerLabel: 'Billing Admin - Nova Corp',
      sentiment: 'NEG' as const,
      sentimentScore: 0.07,
      status: 'NEW' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(18),
    },
    {
      content: 'Requesting an option to pause billing during the beta period while we evaluate the platform.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #5601',
      customerLabel: 'Product Manager - StartupLab',
      sentiment: 'NEU' as const,
      sentimentScore: 0.52,
      status: 'NEW' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(21),
    },

    // --- App Store Reviews ---
    {
      content: 'The dashboard load time has improved dramatically after the latest update! Really crisp animations and responsive charts.',
      channel: 'app_store',
      sourceRef: 'AppStore #9421',
      customerLabel: 'Enterprise Client - TechFlow',
      sentiment: 'POS' as const,
      sentimentScore: 0.94,
      status: 'ACTIONED' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(1),
    },
    {
      content: 'Mobile menu dropdown gets cut off on smaller iPhone screens in dark mode.',
      channel: 'app_store',
      sourceRef: 'AppStore #8801',
      customerLabel: 'Mobile User',
      sentiment: 'NEG' as const,
      sentimentScore: 0.28,
      status: 'REVIEWED' as const,
      themeId: themeUI.id,
      createdAt: daysAgo(6),
    },
    {
      content: 'The latest iOS update makes the app freeze when scrolling through long feedback lists.',
      channel: 'app_store',
      sourceRef: 'AppStore #9032',
      customerLabel: 'Mobile Reviewer',
      sentiment: 'NEG' as const,
      sentimentScore: 0.17,
      status: 'REVIEWED' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(8),
    },
    {
      content: 'Dark mode text is unreadable due to low contrast on several screens, very frustrating at night.',
      channel: 'app_store',
      sourceRef: 'AppStore #9110',
      customerLabel: 'Night User',
      sentiment: 'NEG' as const,
      sentimentScore: 0.24,
      status: 'NEW' as const,
      themeId: themeUI.id,
      createdAt: daysAgo(11),
    },
    {
      content: 'New onboarding flow is intuitive and clean. Great redesign compared to the previous version!',
      channel: 'app_store',
      sourceRef: 'AppStore #9204',
      customerLabel: 'First Time User',
      sentiment: 'POS' as const,
      sentimentScore: 0.9,
      status: 'ACTIONED' as const,
      themeId: themeUI.id,
      createdAt: daysAgo(16),
    },
    {
      content: 'App takes ages to sync data and sometimes shows stale information until a manual refresh.',
      channel: 'app_store',
      sourceRef: 'AppStore #9266',
      customerLabel: 'Daily Driver',
      sentiment: 'NEG' as const,
      sentimentScore: 0.22,
      status: 'NEW' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(20),
    },
    {
      content: 'Would be nice to have home screen widgets for quick metrics without opening the full app.',
      channel: 'app_store',
      sourceRef: 'AppStore #9348',
      customerLabel: 'Power User',
      sentiment: 'NEU' as const,
      sentimentScore: 0.58,
      status: 'REVIEWED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(24),
    },

    // --- NPS Surveys ---
    {
      content: 'Overall NPS rating 9/10. The AI auto-tagging feature saves our team over 5 hours every week during sprint reviews.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Growth Lead - SaaSify',
      sentiment: 'POS' as const,
      sentimentScore: 0.96,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(2),
    },
    {
      content: 'NPS 4. The platform has been extremely slow since last week, frustrating our whole team during reviews.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Team Lead - CloudNine',
      sentiment: 'NEG' as const,
      sentimentScore: 0.13,
      status: 'REVIEWED' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(5),
    },
    {
      content: 'NPS 9. Transparent pricing and easy seat management. Very satisfied with the billing experience.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Ops Manager - Northwind',
      sentiment: 'POS' as const,
      sentimentScore: 0.95,
      status: 'ACTIONED' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(10),
    },
    {
      content: 'NPS 3. Poor support experience when our integration broke; it took them 6 days to even acknowledge the ticket.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Integration Lead - BetaWorks',
      sentiment: 'NEG' as const,
      sentimentScore: 0.06,
      status: 'NEW' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(13),
    },
    {
      content: 'NPS 6. Product is okay but lacks advanced role-based permissions that our security team requires.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Security Manager - InnoSoft',
      sentiment: 'NEU' as const,
      sentimentScore: 0.56,
      status: 'REVIEWED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(17),
    },
    {
      content: 'NPS 2. Billing errors and unexpected charges are pushing us to cancel our subscription.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'CEO - StartupLab',
      sentiment: 'NEG' as const,
      sentimentScore: 0.04,
      status: 'NEW' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(22),
    },

    // --- Sales Calls ---
    {
      content: 'We need automated weekly PDF export reports so our executive team can review feedback without logging in every day.',
      channel: 'sales_call',
      sourceRef: 'Zoom Call 2026-08-02',
      customerLabel: 'VP Product - InnovateHQ',
      sentiment: 'NEU' as const,
      sentimentScore: 0.55,
      status: 'NEW' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(3),
    },
    {
      content: 'Would love to see OAuth SSO support for Azure AD / Okta enterprise logins.',
      channel: 'sales_call',
      sourceRef: 'Enterprise Pitch Call',
      customerLabel: 'CISO - BioTech Labs',
      sentiment: 'NEU' as const,
      sentimentScore: 0.62,
      status: 'NEW' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(6),
    },
    {
      content: 'The HubSpot integration during the demo was impressive and would solve our sync pain points right away.',
      channel: 'sales_call',
      sourceRef: 'Demo Call 2026-08-05',
      customerLabel: 'RevOps Lead - InnovateHQ',
      sentiment: 'POS' as const,
      sentimentScore: 0.89,
      status: 'REVIEWED' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(8),
    },
    {
      content: 'Prospect expressed concern about latency during peak hours based on community reviews they read beforehand.',
      channel: 'sales_call',
      sourceRef: 'Discovery Call 2026-08-08',
      customerLabel: 'CTO - CloudNine',
      sentiment: 'NEG' as const,
      sentimentScore: 0.31,
      status: 'REVIEWED' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(11),
    },
    {
      content: 'Enterprise lead asked whether annual prepayment discounts apply to the Pro tier and seat upgrades.',
      channel: 'sales_call',
      sourceRef: 'Pricing Call 2026-08-10',
      customerLabel: 'Procurement - Apex Global',
      sentiment: 'NEU' as const,
      sentimentScore: 0.6,
      status: 'NEW' as const,
      themeId: themeBilling.id,
      createdAt: daysAgo(14),
    },
    {
      content: 'The new AI summary reports are a huge selling point for our renewals conversation next quarter.',
      channel: 'sales_call',
      sourceRef: 'Renewal Call 2026-08-12',
      customerLabel: 'Customer Success - SaaSify',
      sentiment: 'POS' as const,
      sentimentScore: 0.92,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(19),
    },
    {
      content: 'Customer was frustrated that the Zapier integration does not support custom fields yet, blocking their automation.',
      channel: 'sales_call',
      sourceRef: 'Tech Call 2026-08-14',
      customerLabel: 'Automation Lead - BetaWorks',
      sentiment: 'NEG' as const,
      sentimentScore: 0.26,
      status: 'NEW' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(23),
    },

    // --- Community Posts ---
    {
      content: 'The Slack integration setup was seamless! We get real-time alerts whenever a customer leaves an NPS rating < 6.',
      channel: 'community_post',
      sourceRef: 'Discord #integrations',
      customerLabel: 'Community Lead',
      sentiment: 'POS' as const,
      sentimentScore: 0.91,
      status: 'REVIEWED' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(1),
    },
    {
      content: 'The recent UI overhaul is gorgeous. Navigation feels much faster and cleaner now overall.',
      channel: 'community_post',
      sourceRef: 'Discord #design',
      customerLabel: 'UI Enthusiast',
      sentiment: 'POS' as const,
      sentimentScore: 0.88,
      status: 'ACTIONED' as const,
      themeId: themeUI.id,
      createdAt: daysAgo(7),
    },
    {
      content: 'Still waiting for bulk PDF export. Our team exports individual reports all day which is painful.',
      channel: 'community_post',
      sourceRef: 'Forum #feature-requests',
      customerLabel: 'Ops Analyst',
      sentiment: 'NEG' as const,
      sentimentScore: 0.29,
      status: 'REVIEWED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(10),
    },
    {
      content: 'Anyone else experiencing random API timeouts this week? It keeps interrupting our webhook workflows.',
      channel: 'community_post',
      sourceRef: 'Discord #support',
      customerLabel: 'API Builder',
      sentiment: 'NEG' as const,
      sentimentScore: 0.2,
      status: 'NEW' as const,
      themeId: themePerf.id,
      createdAt: daysAgo(13),
    },
    {
      content: 'We would love a native Notion integration to mirror our feedback threads into our internal wiki.',
      channel: 'community_post',
      sourceRef: 'Forum #integrations',
      customerLabel: 'KM Manager',
      sentiment: 'NEU' as const,
      sentimentScore: 0.59,
      status: 'REVIEWED' as const,
      themeId: themeIntegrations.id,
      createdAt: daysAgo(18),
    },
    {
      content: 'Automated weekly digest emails have been a game changer for stakeholder alignment across our org.',
      channel: 'community_post',
      sourceRef: 'Discord #tips',
      customerLabel: 'Admin - Northwind',
      sentiment: 'POS' as const,
      sentimentScore: 0.93,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(25),
    },
  ];

  for (const fb of sampleFeedbacks) {
    const created = await prisma.feedback.create({
      data: {
        content: fb.content,
        channel: fb.channel,
        sourceRef: fb.sourceRef,
        customerLabel: fb.customerLabel,
        sentiment: fb.sentiment,
        sentimentScore: fb.sentimentScore,
        status: fb.status,
        workspaceId: workspace.id,
        createdAt: fb.createdAt,
      },
    });

    await prisma.feedbackTheme.create({
      data: {
        feedbackId: created.id,
        themeId: fb.themeId,
        confidence: 0.92,
      },
    });
  }

  // Create Sample Report
  await prisma.report.create({
    data: {
      title: 'Q3 Executive Feedback Intelligence Summary',
      periodStart: new Date('2026-07-01'),
      periodEnd: new Date('2026-08-31'),
      generatedBy: admin.name,
      workspaceId: workspace.id,
      contentJson: JSON.stringify({
        summary: 'Customer sentiment improved by +18% following performance optimizations in the core dashboard. Top feature request remains PDF export automation.',
        topThemes: ['Performance & Speed', 'Feature Requests', 'Integrations & Webhooks'],
        totalAnalyzed: 142,
        positiveRatio: 0.72,
        keyActionItems: [
          'Prioritize PDF Export feature for Q4 roadmap.',
          'Optimize CSV export streaming for dataset queries > 10,000 rows.',
          'Fix mobile navigation overflow bug on iOS viewports.',
        ],
      }),
    },
  });

  console.log('Seeding completed successfully!');
  console.log(`Demo Workspace: ${workspace.name}`);
  console.log(`Demo User: admin@projectloop.ai / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });