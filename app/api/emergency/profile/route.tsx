import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { EmergencyProfileTable, EmergencyContactsTable } from '@/config/schema'
import { eq } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress

    // Get profile
    const profiles = await db
      .select()
      .from(EmergencyProfileTable)
      .where(eq(EmergencyProfileTable.userId, userEmail))
      .limit(1)

    // Get contacts
    const contacts = await db
      .select()
      .from(EmergencyContactsTable)
      .where(eq(EmergencyContactsTable.userId, userEmail))

    const profile = profiles[0] || null
    
    // Parse JSON strings if profile exists
    if (profile) {
      return NextResponse.json({
        profile: {
          bloodType: profile.bloodType || '',
          allergies: profile.allergies ? JSON.parse(profile.allergies) : [],
          medications: profile.medications ? JSON.parse(profile.medications) : [],
          medicalConditions: profile.medicalConditions
            ? JSON.parse(profile.medicalConditions)
            : [],
          emergencyNotes: profile.emergencyNotes || '',
          shareLocation: profile.shareLocation === 1,
        },
        contacts,
      })
    }

    return NextResponse.json({
      profile: null,
      contacts,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress
    const {
      bloodType,
      allergies,
      medications,
      medicalConditions,
      emergencyNotes,
      shareLocation,
    } = await req.json()

    // Check if profile exists
    const existing = await db
      .select()
      .from(EmergencyProfileTable)
      .where(eq(EmergencyProfileTable.userId, userEmail))
      .limit(1)

    const profileData = {
      userId: userEmail,
      bloodType: bloodType || '',
      allergies: JSON.stringify(allergies || []),
      medications: JSON.stringify(medications || []),
      medicalConditions: JSON.stringify(medicalConditions || []),
      emergencyNotes: emergencyNotes || '',
      shareLocation: shareLocation ? 1 : 0,
      updatedOn: new Date().toISOString(),
    }

    if (existing.length > 0) {
      // Update existing profile
      await db
        .update(EmergencyProfileTable)
        .set(profileData)
        .where(eq(EmergencyProfileTable.userId, userEmail))
    } else {
      // Create new profile
      await db.insert(EmergencyProfileTable).values(profileData)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Save profile error:', error)
    console.error('Error details:', error?.message, error?.stack)
    return NextResponse.json({ 
      error: 'Failed to save profile', 
      details: error?.message 
    }, { status: 500 })
  }
}
