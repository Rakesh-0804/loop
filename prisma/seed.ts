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
  const sampleFeedbacks = [
    {
      content: 'The dashboard load time has improved dramatically after the latest update! Really crisp animations and responsive charts.',
      channel: 'app_store',
      sourceRef: 'AppStore #9421',
      customerLabel: 'Enterprise Client - TechFlow',
      sentiment: 'POS' as const,
      sentimentScore: 0.94,
      status: 'ACTIONED' as const,
      themeId: themePerf.id,
    },
    {
      content: 'We need automated weekly PDF export reports so our executive team can review feedback without logging in every day.',
      channel: 'sales_call',
      sourceRef: 'Zoom Call 2026-08-02',
      customerLabel: 'VP Product - InnovateHQ',
      sentiment: 'NEU' as const,
      sentimentScore: 0.55,
      status: 'NEW' as const,
      themeId: themeFeatures.id,
    },
    {
      content: 'Billing invoice failed to generate the tax breakdown item. Customer support took 3 days to reply to our ticket.',
      channel: 'support_ticket',
      sourceRef: 'Ticket #4812',
      customerLabel: 'Finance Director - Apex Global',
      sentiment: 'NEG' as const,
      sentimentScore: 0.12,
      status: 'NEW' as const,
      themeId: themeBilling.id,
    },
    {
      content: 'The Slack integration setup was seamless! We get real-time alerts whenever a customer leaves an NPS rating < 6.',
      channel: 'community_post',
      sourceRef: 'Discord #integrations',
      customerLabel: 'Community Lead',
      sentiment: 'POS' as const,
      sentimentScore: 0.91,
      status: 'REVIEWED' as const,
      themeId: themeIntegrations.id,
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
    },
    {
      content: 'Overall NPS rating 9/10. The AI auto-tagging feature saves our team over 5 hours every week during sprint reviews.',
      channel: 'nps_survey',
      sourceRef: 'NPS Q3 Survey',
      customerLabel: 'Growth Lead - SaaSify',
      sentiment: 'POS' as const,
      sentimentScore: 0.96,
      status: 'ACTIONED' as const,
      themeId: themeFeatures.id,
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