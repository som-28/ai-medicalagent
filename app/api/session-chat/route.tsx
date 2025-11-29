import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const { notes, selectedDoctor } = await req.json();
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userEmail = user.primaryEmailAddress.emailAddress;

    // Check if user is premium (you'll need to implement this check based on your subscription logic)
    const isPremium = user.publicMetadata?.isPremium === true;

    if (!isPremium) {
      // Count consultations this month for free users
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const consultationsThisMonth = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, userEmail));

      // Filter by month (since createdOn is varchar, we need to parse)
      const monthlyCount = consultationsThisMonth.filter(session => {
        const sessionDate = new Date(session.createdOn || '');
        return sessionDate >= startOfMonth;
      }).length;

      if (monthlyCount >= 5) {
        return NextResponse.json({ 
          error: 'Free plan limit reached. You have used all 5 consultations this month. Upgrade to Premium for unlimited consultations.',
          limitReached: true,
          currentCount: monthlyCount,
          limit: 5
        }, { status: 403 });
      }
    }

    const sessionId = uuidv4();

    const result = await db.insert(SessionChatTable).values({
      sessionId,
      createdBy: userEmail,
      notes,
      selectedDoctor,
      createdOn: new Date().toString()
    }).returning(); 

    console.log("Inserted session:", result); 

    return NextResponse.json(result[0]); 
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: errorMessage });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const user = await currentUser();
  
  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const userEmail = user.primaryEmailAddress.emailAddress;

    if (sessionId === 'all' || !sessionId) {
      const result = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, userEmail))
        .orderBy(desc(SessionChatTable.id));

      return NextResponse.json(result);
    } else {
      const result = await db.select().from(SessionChatTable)
        .where(eq(SessionChatTable.sessionId, sessionId));

      return NextResponse.json(result[0] || null);
    }
  } catch (e) {
    console.error('Error in GET /api/session-chat:', e);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    );
  }
}