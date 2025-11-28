import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { EmergencyHistoryTable } from '@/config/schema'
import { eq, desc } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress

    const history = await db
      .select()
      .from(EmergencyHistoryTable)
      .where(eq(EmergencyHistoryTable.userId, userEmail))
      .orderBy(desc(EmergencyHistoryTable.triggeredAt))

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get history error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
