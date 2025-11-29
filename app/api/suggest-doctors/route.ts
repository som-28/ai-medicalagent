import { openai } from "@/config/OpenAiModel";
import { AIDoctorAgents } from "@/shared/list";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) { 
    const { notes } = await req.json();

    if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
        return NextResponse.json(
            { error: 'Notes are required' },
            { status: 400 }
        );
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
                { role: 'system', content: JSON.stringify(AIDoctorAgents) },
                { role: 'user', content: "User Notes/Symptoms:" + notes + ", Based on user notes and symptoms, please suggest a list of doctors. Return Object in JSON only." },
            ],
        });
 
        const rawResp = completion.choices[0].message;
        const content = rawResp.content;
        
        if (!content) {
            throw new Error('No content in AI response');
        }

        const Resp = content.trim().replace('```json', '').replace('```', '');
        const JSONResp = JSON.parse(Resp);

        return NextResponse.json(JSONResp);
    } catch (e) {
        console.error('Error suggesting doctors:', e);
        return NextResponse.json(
            { error: 'Failed to suggest doctors' },
            { status: 500 }
        );
    }
}