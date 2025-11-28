import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/config/db'
import { EmergencyContactsTable } from '@/config/schema'
import { eq, and } from 'drizzle-orm'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress

    const contacts = await db
      .select()
      .from(EmergencyContactsTable)
      .where(eq(EmergencyContactsTable.userId, userEmail))

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress
    const { name, relationship, phoneNumber, email, isPrimary } = await req.json()

    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await db
        .update(EmergencyContactsTable)
        .set({ isPrimary: 0 })
        .where(eq(EmergencyContactsTable.userId, userEmail))
    }

    const contact = await db.insert(EmergencyContactsTable).values({
      userId: userEmail,
      name,
      relationship: relationship || '',
      phoneNumber,
      email: email || '',
      isPrimary: isPrimary ? 1 : 0,
      createdOn: new Date().toISOString(),
    }).returning()

    return NextResponse.json({ success: true, contact: contact[0] })
  } catch (error) {
    console.error('Create contact error:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress
    const { id, name, relationship, phoneNumber, email, isPrimary } = await req.json()

    if (!id || !name || !phoneNumber) {
      return NextResponse.json(
        { error: 'ID, name and phone number are required' },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await db
        .update(EmergencyContactsTable)
        .set({ isPrimary: 0 })
        .where(eq(EmergencyContactsTable.userId, userEmail))
    }

    const contact = await db
      .update(EmergencyContactsTable)
      .set({
        name,
        relationship: relationship || '',
        phoneNumber,
        email: email || '',
        isPrimary: isPrimary ? 1 : 0,
      })
      .where(
        and(
          eq(EmergencyContactsTable.id, id),
          eq(EmergencyContactsTable.userId, userEmail)
        )
      )
      .returning()

    return NextResponse.json({ success: true, contact: contact[0] })
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.primaryEmailAddress.emailAddress
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
    }

    await db
      .delete(EmergencyContactsTable)
      .where(
        and(
          eq(EmergencyContactsTable.id, parseInt(id)),
          eq(EmergencyContactsTable.userId, userEmail)
        )
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}
