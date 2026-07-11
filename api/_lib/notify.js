const APP_URL = process.env.APP_URL || process.env.SITE_URL || 'https://www.vertexed.app';

/**
 * Send waitlist approval email via Resend when configured.
 * Falls back to structured logging when RESEND_API_KEY is unset.
 */
export async function sendWaitlistApprovedEmail(email, inviteLink) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'VertexED <onboarding@vertexed.app>';
  const signupUrl = inviteLink || `${APP_URL.replace(/\/$/, '')}/signup`;

  const subject = 'Your VertexED waitlist spot is ready';
  const html = `
    <p>Hi,</p>
    <p>Your VertexED private beta application has been <strong>approved</strong>.</p>
    <p>Create your account using this link (same email you joined with):</p>
    <p><a href="${signupUrl}">${signupUrl}</a></p>
    <p>On the signup page, choose <strong>Invite signup</strong>, enter your password, and complete onboarding.</p>
    <p>— The VertexED team</p>
  `.trim();

  if (!apiKey) {
    console.info('[notify] Waitlist approved (email not sent — set RESEND_API_KEY):', email, signupUrl);
    return { sent: false, reason: 'RESEND_API_KEY not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('[notify] Resend error:', response.status, body);
      return { sent: false, reason: 'Email provider error' };
    }

    return { sent: true };
  } catch (err) {
    console.error('[notify] Failed to send approval email:', err);
    return { sent: false, reason: 'Email send failed' };
  }
}
