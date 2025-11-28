import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Missing Twilio credentials in environment variables');
}

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmergencyNotificationData {
  userName: string;
  userEmail: string;
  timestamp: string;
  location?: string;
  medicalInfo?: {
    bloodType?: string;
    allergies?: string;
    medications?: string;
    conditions?: string;
  };
  sessionId?: string;
}

/**
 * Send SMS to emergency contact
 */
export async function sendEmergencySMS(
  contact: EmergencyContact,
  data: EmergencyNotificationData
): Promise<{ success: boolean; error?: string }> {
  if (!twilioClient || !twilioPhoneNumber) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    // Format phone number (ensure it has country code)
    let formattedPhone = contact.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhone = '+91' + formattedPhone.replace(/^0/, '');
    }

    console.log(`[Twilio] Attempting to send SMS to ${contact.name} (${formattedPhone})`);

    // Create SHORT message body for trial account (160 char limit)
    const message = `🚨 EMERGENCY SOS
${data.userName} needs help!
Time: ${new Date().toLocaleTimeString('en-IN')}
${data.medicalInfo?.bloodType ? `Blood: ${data.medicalInfo.bloodType}` : ''}
Contact: ${data.userEmail}`;

    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    console.log(`[Twilio] ✓ SMS sent to ${contact.name} - SID: ${result.sid}, Status: ${result.status}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Twilio] ✗ Failed to send SMS to ${contact.name} (${contact.phone}):`, {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
    });
    return { 
      success: false, 
      error: `${error.code || 'ERROR'}: ${error.message || 'Failed to send SMS'}` 
    };
  }
}

/**
 * Send SMS to multiple emergency contacts
 */
export async function sendEmergencyAlerts(
  contacts: EmergencyContact[],
  data: EmergencyNotificationData
): Promise<{ 
  total: number; 
  successful: number; 
  failed: number;
  results: Array<{ contact: string; success: boolean; error?: string }> 
}> {
  const results = await Promise.allSettled(
    contacts.map(contact => 
      sendEmergencySMS(contact, data).then(result => ({
        contact: contact.name,
        ...result
      }))
    )
  );

  const processed = results.map(r => 
    r.status === 'fulfilled' ? r.value : { contact: 'unknown', success: false, error: 'Promise rejected' }
  );

  return {
    total: contacts.length,
    successful: processed.filter(r => r.success).length,
    failed: processed.filter(r => !r.success).length,
    results: processed
  };
}
