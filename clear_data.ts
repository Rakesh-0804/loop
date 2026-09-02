import { prisma } from './lib/db';

async function main() {
  console.log('Clearing all feedback records, report summaries, and theme links from Neon PostgreSQL database...');

  try {
    const deletedThemesLinks = await prisma.feedbackTheme.deleteMany();
    console.log('Deleted FeedbackTheme links:', deletedThemesLinks.count);

    const deletedEmbeddings = await prisma.embedding.deleteMany();
    console.log('Deleted Embeddings:', deletedEmbeddings.count);

    const deletedFeedbacks = await prisma.feedback.deleteMany();
    console.log('Deleted Feedback records:', deletedFeedbacks.count);

    const deletedReports = await prisma.report.deleteMany();
    console.log('Deleted Reports:', deletedReports.count);

    console.log('SUCCESS: All feedback and report data has been completely cleared!');
  } catch (e) {
    console.error('Error clearing data:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
