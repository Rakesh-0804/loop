import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  console.log('Seeding Project LOOP workspace, users, and multi-channel feedback records...');

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

  await prisma.user.create({
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
      color: '#3B82F6',
      workspaceId: workspace.id,
    },
  });

  const themeUI = await prisma.theme.create({
    data: {
      name: 'UI/UX Usability',
      description: 'Navigation clarity, mobile layout responsiveness, and design aesthetics.',
      color: '#8B5CF6',
      workspaceId: workspace.id,
    },
  });

  const themeBilling = await prisma.theme.create({
    data: {
      name: 'Billing & Subscriptions',
      description: 'Pricing plans, invoice clarity, payment processing, and seat upgrades.',
      color: '#10B981',
      workspaceId: workspace.id,
    },
  });

  const themeIntegrations = await prisma.theme.create({
    data: {
      name: 'Integrations & Webhooks',
      description: 'Slack, Zapier, HubSpot, and REST API connectivity.',
      color: '#F59E0B',
      workspaceId: workspace.id,
    },
  });

  const themeFeatures = await prisma.theme.create({
    data: {
      name: 'Feature Requests',
      description: 'Requested capabilities such as PDF exports, AI summaries, and custom tags.',
      color: '#EC4899',
      workspaceId: workspace.id,
    },
  });

  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const sampleFeedbacks = [
    // Support Tickets
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

    // App Store Reviews
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
      content: 'New onboarding flow is intuitive and clean. Great redesign compared to the previous version!',
      channel: 'app_store',
      sourceRef: 'AppStore #9204',
      customerLabel: 'First Time User',
      sentiment: 'POS' as const,
      sentimentScore: 0.9,
      status: 'ACTIONED' as const,
      themeId: themeUI.id,
      createdAt: daysAgo(12),
    },

    // NPS Surveys
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

    // Sales Calls
    {
      content: 'We need automated weekly PDF export reports so our executive team can review feedback without logging in every day.',
      channel: 'sales_call',
      sourceRef: 'Zoom Call 2026-08-02',
      customerLabel: 'VP Product - InnovateHQ',
      sentiment: 'POS' as const,
      sentimentScore: 0.85,
      status: 'NEW' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(3),
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
      content: 'The new AI summary reports are a huge selling point for our renewals conversation next quarter.',
      channel: 'sales_call',
      sourceRef: 'Renewal Call 2026-08-12',
      customerLabel: 'Customer Success - SaaSify',
      sentiment: 'POS' as const,
      sentimentScore: 0.92,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(14),
    },

    // Community Posts
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
      content: 'Automated weekly digest emails have been a game changer for stakeholder alignment across our org.',
      channel: 'community_post',
      sourceRef: 'Discord #tips',
      customerLabel: 'Admin - Northwind',
      sentiment: 'POS' as const,
      sentimentScore: 0.93,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
      createdAt: daysAgo(15),
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
      periodStart: daysAgo(30),
      periodEnd: new Date(),
      generatedBy: admin.name,
      workspaceId: workspace.id,
      contentJson: JSON.stringify({
        summary: 'Customer sentiment improved significantly following performance optimizations in the core dashboard. Top feature request remains PDF export automation.',
        topThemes: ['Performance & Speed', 'Feature Requests', 'Integrations & Webhooks'],
        totalAnalyzed: sampleFeedbacks.length,
        positiveRatio: 0.59,
        positiveCount: sampleFeedbacks.filter((f) => f.sentiment === 'POS').length,
        neutralCount: 0,
        negativeCount: sampleFeedbacks.filter((f) => f.sentiment === 'NEG').length,
        csatScore: 59,
        npsIndex: 18,
        channelBreakdown: {
          supportTickets: 5,
          appStoreReviews: 4,
          npsSurveys: 3,
          salesCalls: 3,
          communityPosts: 3,
        },
        criticalPainPoints: [
          'Billing invoice failure on tax breakdown calculations',
          'Exporting large CSV files times out during peak concurrency',
          'Mobile viewport menu alignment on dark mode',
        ],
        keyActionItems: [
          'Prioritize automated PDF report export delivery.',
          'Optimize database query caching for inbox filters.',
          'Establish real-time webhook alerts for negative tickets.',
        ],
        strategicRoadmap: [
          { priority: 'HIGH', initiative: 'Database & Search Cache Optimization', impact: 'Reduce feedback query latency by 40%' },
          { priority: 'MEDIUM', initiative: 'Automated Multi-Format Export Engine', impact: 'Improve executive report adoption by 60%' },
          { priority: 'LONG_TERM', initiative: 'Real-Time Slack & Webhook Alerting', impact: 'Decrease response time for negative tickets' },
        ],
      }),
    },
  });

  console.log('Seeding multi-channel feedbacks complete!');
  console.log(`Workspace: ${workspace.name}`);
  console.log(`Feedbacks Added: ${sampleFeedbacks.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });