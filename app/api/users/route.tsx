import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json(
            { error: 'User email not found' },
            { status: 400 }
        );
    }

    try {
        const userEmail = user.primaryEmailAddress.emailAddress;
        const users = await db.select().from(usersTable)
            .where(eq(usersTable.email, userEmail));
    
        if (users?.length === 0) {
            const result = await db.insert(usersTable).values({
                name: user?.fullName || 'User',
                email: userEmail,
                credits: 10
            }).returning();
            return NextResponse.json(result[0]);
        }
        return NextResponse.json(users[0]);
    } catch (e) {
        console.error('Error in POST /api/users:', e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to create or fetch user', details: errorMessage },
            { status: 500 }
        );
    }
}