import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { EmergencyHistoryTable, SessionChatTable, EmergencyContactsTable, EmergencyProfileTable } from '@/config/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

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

    // TODO: Send notifications to emergency contacts
    // This would integrate with your notification service (email/SMS)
    await sendEmergencyNotifications(contacts, emergencyReport, userEmail)

    return NextResponse.json({
      success: true,
      emergencyId: emergencyRecord[0].id,
      contactsNotified: contacts.length,
      message: 'Emergency services notified',
    })
  } catch (error) {
    console.error('Emergency trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger emergency' },
      { status: 500 }
    )
  }
}

async function sendEmergencyNotifications(
  contacts: any[],
  report: any,
  userEmail: string
) {
  // This is a placeholder for notification logic
  // You would integrate with services like:
  // - Twilio for SMS
  // - SendGrid/Resend for Email
  // - Push notifications
  
  console.log('Sending emergency notifications to:', contacts.length, 'contacts')
  console.log('Emergency report:', report)
  
  // Example notification content:
  const message = `
    EMERGENCY ALERT
    
    ${userEmail} has triggered an emergency SOS.
    
    Time: ${report.timestamp}
    
    Medical Information:
    ${report.medicalInfo ? `
    - Blood Type: ${report.medicalInfo.bloodType || 'Not specified'}
    - Allergies: ${report.medicalInfo.allergies || 'None listed'}
    - Medications: ${report.medicalInfo.medications || 'None listed'}
    ` : 'No medical information on file'}
    
    Please check on them immediately or call emergency services.
  `
  
  // TODO: Implement actual notification sending
  // for (const contact of contacts) {
  //   await sendSMS(contact.phoneNumber, message)
  //   if (contact.email) {
  //     await sendEmail(contact.email, 'EMERGENCY ALERT', message)
  //   }
  // }
}
