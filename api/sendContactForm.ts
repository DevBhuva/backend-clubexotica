import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransporter, TO_EMAIL, FROM_LABEL, row, emailHtml } from './_mailer';

interface ContactPayload {
  name: string;
  email: string;
  memberId?: string;
  phone?: string;
  subject: string;
  message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, memberId, phone, subject, message } =
    (req.body ?? {}) as ContactPayload;

  // ── Validation ──────────────────────────────────────────────────────────────
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({
      error: 'Required fields missing: name, email, subject, message',
    });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // ── Build HTML email ─────────────────────────────────────────────────────────
  const safeMsg = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const bodyRows =
    row('Name',      name) +
    row('Email',     `<a href="mailto:${email}" style="color:#b8860b;">${email}</a>`) +
    row('Member ID', memberId || '—') +
    row('Phone',     phone    || '—') +
    row('Subject',   subject) +
    row('Message',   `<span style="white-space:pre-wrap;">${safeMsg}</span>`);

  const adminHtml = emailHtml(
    '📬 New Contact Form Submission',
    '#1a1a2e',
    bodyRows
  );

  // Auto-reply to visitor
  const replyRows =
    row('Dear',          name) +
    row('Your message',  `"${subject}"`) +
    row('What\'s next',  'Our team will respond within one business day.') +
    row('Urgent help?',  '+91 90815 99211 · +91 90816 99211');

  const replyHtml = emailHtml(
    'Thank you for reaching out',
    '#c8971f',
    replyRows
  );

  // ── Send ─────────────────────────────────────────────────────────────────────
  try {
    const transporter = createTransporter();

    // 1 — notify MD
    await transporter.sendMail({
      from:    FROM_LABEL,
      to:      TO_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: `[Contact] ${subject} — ${name}`,
      html:    adminHtml,
    });

    // 2 — acknowledge visitor
    await transporter.sendMail({
      from:    FROM_LABEL,
      to:      email,
      subject: 'We received your message — Club Exotica',
      html:    replyHtml,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[sendContactForm]', msg);
    return res.status(500).json({
      error: `Email delivery failed: ${msg}`,
    });
  }
}
