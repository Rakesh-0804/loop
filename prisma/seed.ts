import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  console.log('Resetting and initializing clean database...');

  // Clean all existing data
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

  // Create Primary Admin User
  await prisma.user.create({
    data: {
      name: 'Alex Mercer (Admin)',
      email: 'admin@projectloop.ai',
      passwordHash,
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  });

  // Create Core Default Themes
  const themes = [
    { name: 'Performance & Speed', description: 'System responsiveness and page load speed.', color: '#3B82F6' },
    { name: 'UI/UX Usability', description: 'Navigation clarity and layout responsiveness.', color: '#8B5CF6' },
    { name: 'Billing & Subscriptions', description: 'Invoices, pricing, and payment processing.', color: '#10B981' },
    { name: 'Integrations & Webhooks', description: 'Slack, Zapier, and REST API connectivity.', color: '#F59E0B' },
    { name: 'Feature Requests', description: 'Requested capabilities such as PDF exports and AI summaries.', color: '#EC4899' },
  ];

  for (const t of themes) {
    await prisma.theme.create({
      data: {
        ...t,
        workspaceId: workspace.id,
      },
    });
  }

  console.log('Clean database initialization complete!');
  console.log(`Workspace: ${workspace.name}`);
  console.log(`Admin User: admin@projectloop.ai / password123`);
  console.log(`Feedbacks: 0 | Reports: 0`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });