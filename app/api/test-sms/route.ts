import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Check environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log('Twilio Config Check:');
    console.log('- Account SID:', accountSid ? '✓ Set' : '✗ Missing');
    console.log('- Auth Token:', authToken ? '✓ Set' : '✗ Missing');
    console.log('- Phone Number:', twilioPhoneNumber || '✗ Missing');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json({
        error: 'Twilio credentials missing',
        details: {
          accountSid: !!accountSid,
          authToken: !!authToken,
          phoneNumber: !!twilioPhoneNumber,
        },
      }, { status: 500 });
    }

    // Initialize Twilio
    const client = twilio(accountSid, authToken);

    // Format phone number
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    console.log('Sending test SMS to:', formattedPhone);

    // Send test SMS
    const message = await client.messages.create({
      body: '🩺 Test message from EchoDoc AI. Your emergency SMS system is working!',
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    console.log('SMS sent successfully:', message.sid);

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
      to: formattedPhone,
      from: twilioPhoneNumber,
    });
  } catch (error: any) {
    console.error('Test SMS Error:', error);
    
    return NextResponse.json({
      error: 'Failed to send SMS',
      details: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    }, { status: 500 });
  }
}
