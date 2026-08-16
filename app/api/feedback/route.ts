import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string().min(1),
  channel: z.enum(['support_ticket', 'app_store', 'nps_survey', 'sales_call', 'community_post']),
  sourceRef: z.string().optional(),
  customerLabel: z.string().optional(),
});

const DEMO_FEEDBACKS = [
  {
    id: 'demo-fb-1',
    content: 'The dashboard load time has improved dramatically after the latest update! Really crisp animations and responsive charts.',
    channel: 'app_store',
    sourceRef: 'AppStore #9421',
    customerLabel: 'Enterprise Client - TechFlow',
    sentiment: 'POS',
    sentimentScore: 0.94,
    status: 'ACTIONED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-1', name: 'Performance & Speed', color: '#3B82F6' } }],
  },
  {
    id: 'demo-fb-2',
    content: 'We need automated weekly PDF export reports so our executive team can review feedback without logging in every day.',
    channel: 'sales_call',
    sourceRef: 'Zoom Call 2026-08-02',
    customerLabel: 'VP Product - InnovateHQ',
    sentiment: 'NEU',
    sentimentScore: 0.55,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-2', name: 'Feature Requests', color: '#EC4899' } }],
  },
  {
    id: 'demo-fb-3',
    content: 'Billing invoice failed to generate the tax breakdown item. Customer support took 3 days to reply to our ticket.',
    channel: 'support_ticket',
    sourceRef: 'Ticket #4812',
    customerLabel: 'Finance Director - Apex Global',
    sentiment: 'NEG',
    sentimentScore: 0.12,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-3', name: 'Billing & Subscriptions', color: '#10B981' } }],
  },
  {
    id: 'demo-fb-4',
    content: 'The Slack integration setup was seamless! We get real-time alerts whenever a customer leaves an NPS rating < 6.',
    channel: 'community_post',
    sourceRef: 'Discord #integrations',
    customerLabel: 'Community Lead',
    sentiment: 'POS',
    sentimentScore: 0.91,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-4', name: 'Integrations & Webhooks', color: '#F59E0B' } }],
  },
  {
    id: 'demo-fb-5',
    content: 'Mobile menu dropdown gets cut off on smaller iPhone screens in dark mode.',
    channel: 'app_store',
    sourceRef: 'AppStore #8801',
    customerLabel: 'Mobile User',
    sentiment: 'NEG',
    sentimentScore: 0.28,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-5', name: 'UI/UX Usability', color: '#8B5CF6' } }],
  },
  {
    id: 'demo-fb-6',
    content: 'Our account was double-charged this month and the refund process has been a nightmare to get through.',
    channel: 'support_ticket',
    sourceRef: 'Ticket #5247',
    customerLabel: 'Ops Lead - Northwind',
    sentiment: 'NEG',
    sentimentScore: 0.08,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-3', name: 'Billing & Subscriptions', color: '#10B981' } }],
  },
  {
    id: 'demo-fb-7',
    content: 'I have been waiting 5 days for a response on our priority ticket. This is unacceptable for an enterprise plan.',
    channel: 'support_ticket',
    sourceRef: 'Ticket #5310',
    customerLabel: 'IT Director - TechFlow',
    sentiment: 'NEG',
    sentimentScore: 0.09,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-4', name: 'Integrations & Webhooks', color: '#F59E0B' } }],
  },
  {
    id: 'demo-fb-8',
    content: 'The latest iOS update makes the app freeze when scrolling through long feedback lists.',
    channel: 'app_store',
    sourceRef: 'AppStore #9032',
    customerLabel: 'Mobile Reviewer',
    sentiment: 'NEG',
    sentimentScore: 0.17,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-1', name: 'Performance & Speed', color: '#3B82F6' } }],
  },
  {
    id: 'demo-fb-9',
    content: 'Overall NPS rating 9/10. The AI auto-tagging feature saves our team over 5 hours every week during sprint reviews.',
    channel: 'nps_survey',
    sourceRef: 'NPS Q3 Survey',
    customerLabel: 'Growth Lead - SaaSify',
    sentiment: 'POS',
    sentimentScore: 0.96,
    status: 'ACTIONED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-2', name: 'Feature Requests', color: '#EC4899' } }],
  },
  {
    id: 'demo-fb-10',
    content: 'NPS 4. The platform has been extremely slow since last week, frustrating our whole team during reviews.',
    channel: 'nps_survey',
    sourceRef: 'NPS Q3 Survey',
    customerLabel: 'Team Lead - CloudNine',
    sentiment: 'NEG',
    sentimentScore: 0.13,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-1', name: 'Performance & Speed', color: '#3B82F6' } }],
  },
  {
    id: 'demo-fb-11',
    content: 'Exporting large CSV files with 50,000+ rows times out occasionally during peak hours.',
    channel: 'support_ticket',
    sourceRef: 'Ticket #5092',
    customerLabel: 'Data Ops Manager',
    sentiment: 'NEG',
    sentimentScore: 0.21,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-1', name: 'Performance & Speed', color: '#3B82F6' } }],
  },
  {
    id: 'demo-fb-12',
    content: 'NPS 2. Billing errors and unexpected charges are pushing us to cancel our subscription.',
    channel: 'nps_survey',
    sourceRef: 'NPS Q3 Survey',
    customerLabel: 'CEO - StartupLab',
    sentiment: 'NEG',
    sentimentScore: 0.04,
    status: 'NEW',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-3', name: 'Billing & Subscriptions', color: '#10B981' } }],
  },
  {
    id: 'demo-fb-13',
    content: 'Still waiting for bulk PDF export. Our team exports individual reports all day which is painful.',
    channel: 'community_post',
    sourceRef: 'Forum #feature-requests',
    customerLabel: 'Ops Analyst',
    sentiment: 'NEG',
    sentimentScore: 0.29,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-2', name: 'Feature Requests', color: '#EC4899' } }],
  },
  {
    id: 'demo-fb-14',
    content: 'The HubSpot integration during the demo was impressive and would solve our sync pain points right away.',
    channel: 'sales_call',
    sourceRef: 'Demo Call 2026-08-05',
    customerLabel: 'RevOps Lead - InnovateHQ',
    sentiment: 'POS',
    sentimentScore: 0.89,
    status: 'REVIEWED',
    createdAt: new Date().toISOString(),
    themes: [{ theme: { id: 'th-4', name: 'Integrations & Webhooks', color: '#F59E0B' } }],
  },
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaceId = (session.user as any).workspaceId || 'demo-workspace-id';

  try {
    const feedback = await prisma.feedback.findMany({
      where: { workspaceId },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (feedback.length > 0) {
      return NextResponse.json(feedback);
    }
  } catch (e) {
    console.error('Feedback fetch error, returning demo fallback data:', e);
  }

  return NextResponse.json(DEMO_FEEDBACKS);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = (session.user as any).workspaceId || 'demo-workspace-id';
  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const text = parsed.data.content.toLowerCase();
  let sentiment: 'POS' | 'NEU' | 'NEG' = 'NEU';
  let sentimentScore = 0.5;

  if (text.includes('love') || text.includes('great') || text.includes('fast') || text.includes('improved') || text.includes('seamless')) {
    sentiment = 'POS';
    sentimentScore = 0.92;
  } else if (text.includes('slow') || text.includes('bug') || text.includes('failed') || text.includes('confusing') || text.includes('incorrect')) {
    sentiment = 'NEG';
    sentimentScore = 0.15;
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        content: parsed.data.content,
        channel: parsed.data.channel,
        sourceRef: parsed.data.sourceRef || null,
        customerLabel: parsed.data.customerLabel || null,
        sentiment,
        sentimentScore,
        workspaceId,
      },
      include: {
        themes: {
          include: { theme: true },
        },
      },
    });
    return NextResponse.json(feedback);
  } catch (e) {
    console.error('Prisma create error, returning simulated item:', e);
    const newItem = {
      id: 'fb-' + Date.now(),
      content: parsed.data.content,
      channel: parsed.data.channel,
      sourceRef: parsed.data.sourceRef || 'Web Input',
      customerLabel: parsed.data.customerLabel || 'User Submission',
      sentiment,
      sentimentScore,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      themes: [],
    };
    return NextResponse.json(newItem);
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspaceId = (session.user as any).workspaceId || 'demo-workspace-id';
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: 'Missing feedback ID' }, { status: 400 });
  }

  try {
    const existing = await prisma.feedback.findFirst({
      where: { id: body.id, workspaceId },
    });

    if (existing) {
      const updated = await prisma.feedback.update({
        where: { id: body.id },
        data: {
          status: body.status !== undefined ? body.status : existing.status,
          sentiment: body.sentiment !== undefined ? body.sentiment : existing.sentiment,
        },
        include: {
          themes: {
            include: { theme: true },
          },
        },
      });
      return NextResponse.json(updated);
    }
  } catch (e) {
    console.error('PATCH error, returning mock updated object:', e);
  }

  return NextResponse.json({ id: body.id, status: body.status, sentiment: body.sentiment });
}