import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { EmergencyHistoryTable, SessionChatTable, EmergencyContactsTable, EmergencyProfileTable } from '@/config/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'
import { sendEmergencyAlerts } from '@/lib/twilioClient'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    const userEmail = user.primaryEmailAddress.emailAddress

    // Get emergency contacts
    const contacts = await db
      .select()
      .from(EmergencyContactsTable)
      .where(eq(EmergencyContactsTable.userId, userEmail))

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency contacts configured' },
        { status: 400 }
      )
    }

    // Get emergency profile
    const profile = await db
      .select()
      .from(EmergencyProfileTable)
      .where(eq(EmergencyProfileTable.userId, userEmail))
      .limit(1)

    // Get session data if sessionId provided
    let sessionData = null
    if (sessionId) {
      const sessions = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.sessionId, sessionId))
        .limit(1)
      sessionData = sessions[0] || null
    }

    // Generate emergency report
    const emergencyReport = {
      userEmail,
      sessionId,
      timestamp: new Date().toISOString(),
      medicalInfo: profile[0] || null,
      sessionSummary: sessionData
        ? {
            doctor: sessionData.selectedDoctor,
            notes: sessionData.notes,
            conversation: sessionData.conversation,
          }
        : null,
    }

    // Get location if enabled
    let location = null
    if (profile[0]?.shareLocation) {
      // Location would be passed from client
      location = { latitude: null, longitude: null, timestamp: new Date().toISOString() }
    }

    // Create emergency record
    const emergencyRecord = await db.insert(EmergencyHistoryTable).values({
      userId: userEmail,
      sessionId: sessionId || null,
      emergencyType: 'SOS',
      urgencyLevel: 'High',
      status: 'Active',
      contactsNotified: contacts,
      location,
      emergencyReport,
      triggeredAt: new Date().toISOString(),
      notes: 'Emergency triggered by user',
    }).returning()

    // Send SMS alerts to emergency contacts
    const notificationResults = await sendEmergencyAlerts(
      contacts.map(c => ({
        name: c.name,
        phone: c.phoneNumber,
        email: c.email || undefined,
        relationship: c.relationship || 'Contact',
        isPrimary: c.isPrimary === 1,
      })),
      {
        userName: user.fullName || user.firstName || 'User',
        userEmail,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        location: location ? `${location.latitude}, ${location.longitude}` : undefined,
        medicalInfo: profile[0] ? {
          bloodType: profile[0].bloodType || undefined,
          allergies: profile[0].allergies || undefined,
          medications: profile[0].medications || undefined,
          conditions: profile[0].medicalConditions || undefined,
        } : undefined,
        sessionId: sessionId || undefined,
      }
    )

    console.log('SMS notification results:', notificationResults)

    return NextResponse.json({
      success: true,
      emergencyId: emergencyRecord[0].id,
      contactsNotified: notificationResults.successful,
      totalContacts: notificationResults.total,
      failed: notificationResults.failed,
      message: `Emergency alert sent to ${notificationResults.successful} contact(s)`,
      details: notificationResults.results,
    })
  } catch (error) {
    console.error('Emergency trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger emergency' },
      { status: 500 }
    )
  }
}


