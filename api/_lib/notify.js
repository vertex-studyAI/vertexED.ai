const APP_URL = process.env.APP_URL || process.env.SITE_URL || 'https://www.vertexed.app';

/**
 * Send waitlist approval email via Resend when configured.
 * Falls back to structured logging when RESEND_API_KEY is unset.
 */
export async function sendWaitlistApprovedEmail(email, inviteLink, signupMethod = "email") {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || 'VertexED <onboarding@vertexed.app>';
  const signupUrl = inviteLink || `${APP_URL.replace(/\/$/, '')}/signup`;

  const subject = 'Your VertexED waitlist spot is ready';
  const html = signupMethod === 'google'
    ? `<p>Hi,</p><p>Your VertexED private beta application has been <strong>approved</strong>.</p><p>Sign in with the same Google account you used to join the waitlist:</p><p><a href="${signupUrl}">${signupUrl}</a></p><p>- The VertexED team</p>`
    : `<p>Hi,</p><p>Your VertexED private beta application has been <strong>approved</strong>.</p><p>Create your username and password using this link:</p><p><a href="${signupUrl}">${signupUrl}</a></p><p>- The VertexED team</p>`;

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
