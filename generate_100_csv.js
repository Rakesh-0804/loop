const fs = require('fs');
const path = require('path');

const channels = ['support_ticket', 'app_store', 'nps_survey', 'sales_call', 'community_post'];

const posTemplates = [
  "The new dashboard load speed is insanely fast! Filtering through 10,000+ items takes less than a second now. Amazing performance overhaul.",
  "The Slack webhook integration setup was completely seamless! We now get instant alerts whenever a user submits negative feedback.",
  "We love the AI automated report synthesis feature! It saves our product management team over 6 hours of manual spreadsheet work every single week.",
  "The clean UI design overhaul is gorgeous! Navigation feels smooth, dark mode is easy on the eyes, and onboarding our new team members was effortless.",
  "NPS Score: 10/10. Transparent pricing, easy seat management, and excellent customer service. Highly recommend Project LOOP to any SaaS company!",
  "Customer support resolved our ticket in less than 15 minutes. Super helpful team and extremely professional service.",
  "The HubSpot CRM integration works flawlessly. Prospect interactions are synced automatically with zero manual effort.",
  "Upgrading to the enterprise tier was the best decision we made this quarter. Search latency dropped by 50% across our entire team.",
  "Exporting executive summaries to PDF is incredibly smooth. The print layout looks publication-ready and executive-approved.",
  "Dark mode UI aesthetics are top tier. The subtle background particle visuals make working in the dashboard a joy.",
  "The auto-tagging theme clusters accurately categorize incoming tickets with over 95% accuracy. Huge time saver!",
  "Great app update! Mobile responsiveness is smooth on both iPhone and Android devices now.",
  "The real-time sentiment index meter gives our C-suite immediate clarity during weekly executive reviews.",
  "Setting up multi-tenant role permissions was straightforward. Adding new analysts took under 2 minutes.",
  "We love how easy it is to search historical feedback records by keyword and channel filter."
];

const negTemplates = [
  "Billing invoice failed to generate the tax breakdown item. Customer support ignored our urgent ticket for 4 days and our account was locked unexpectedly.",
  "The latest iOS app update makes the screen freeze every time I scroll through long lists. Page load times are extremely slow and dark mode contrast is unreadable.",
  "Our account was double-charged on our monthly subscription. When we reached out to support, the agent closed our ticket without issuing a refund. Horrible service.",
  "Exporting large CSV files with 50,000+ rows times out repeatedly during peak business hours. Extremely frustrating for our data engineering team.",
  "The mobile menu dropdown menu gets cut off on smaller mobile viewports in landscape mode. Please fix this CSS overflow bug.",
  "Webhook notifications failed silently yesterday, causing our engineering team to miss 5 critical customer outages.",
  "The search query latency is unacceptable during high concurrency hours. Searching feedback text takes over 8 seconds to respond.",
  "NPS Score: 2/10. Frequent system downtime, unresponsive customer support, and buggy CSV export features. Considering switching providers.",
  "Support ticket resolution took 5 business days for a critical severity 1 incident. We are losing trust in the platform.",
  "The app crashes unexpectedly when attempting to filter feedbacks by custom theme badges on Android 14.",
  "Pricing invoice is confusing and missing seat discount itemizations. Please audit our account subscription.",
  "The API endpoint returns intermittent 504 Gateway Timeout errors when executing batch feedback updates.",
  "Dark mode font contrast on table cells is too dim to read under bright office lighting.",
  "Data export dropped 15 feedback records without throwing any validation warning. Serious reliability concern.",
  "User permission roles failed to save updated permissions for our team analyst account."
];

const neuTemplates = [
  "Please provide the complete API documentation for integrating external webhooks with third-party CRM tools.",
  "Can you confirm whether the platform supports multi-region data hosting in European data centers for GDPR compliance?",
  "Checking the release timeline for the upcoming quarterly platform feature roadmap.",
  "What is the maximum file size limit for bulk CSV uploads in the feedback inbox?",
  "Inquiry regarding seat migration procedures from single team plans to enterprise multi-tenant workspaces.",
  "Requesting clarification on data retention policies for resolved support ticket archives.",
  "Does the platform support SAML 2.0 Okta Single Sign-On integration for enterprise accounts?",
  "What are the supported date range parameters when querying the GET /api/reports endpoint?",
  "Can we customize the automated report synthesis prompt to include custom corporate terminology?",
  "Checking if there is a public status page to monitor API uptime and database maintenance schedules."
];

const customers = [
  "Apex Global", "TechFlow", "SaaSify", "Northwind", "InnovateHQ", "CloudNine", "InnoSoft",
  "Acme SaaS Corp", "CyberShield", "DataOps Inc", "Starlight Systems", "Nexus Digital"
];

const rows = ["feedback,channel,customerLabel,sourceRef"];

for (let i = 1; i <= 100; i++) {
  let content = "";
  let type = i % 10;
  if (type >= 1 && type <= 4) {
    // POS (40%)
    content = posTemplates[i % posTemplates.length];
  } else if (type >= 5 && type <= 8) {
    // NEG (40%)
    content = negTemplates[i % negTemplates.length];
  } else {
    // NEU (20%)
    content = neuTemplates[i % neuTemplates.length];
  }

  const channel = channels[i % channels.length];
  const customer = customers[i % customers.length];
  const ref = `Ref #${4000 + i}`;

  // Escape quotes
  const escapedContent = `"${content.replace(/"/g, '""')}"`;
  const escapedCustomer = `"${customer}"`;

  rows.push(`${escapedContent},${channel},${escapedCustomer},${ref}`);
}

const csvData = rows.join('\n');

const projectPath = path.join(__dirname, 'bulk_100_customer_feedbacks.csv');
const desktopPath = 'C:\\Users\\rakes\\OneDrive\\Desktop\\bulk_100_customer_feedbacks.csv';

fs.writeFileSync(projectPath, csvData, 'utf8');
fs.writeFileSync(desktopPath, csvData, 'utf8');

console.log('SUCCESS: Generated bulk_100_customer_feedbacks.csv with 100 rows!');
console.log('Project Path:', projectPath);
console.log('Desktop Path:', desktopPath);
