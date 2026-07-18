import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createTransporter, TO_EMAIL, FROM_LABEL, row, emailHtml } from './_mailer';

interface BookingPayload {
  memberId?:    string;
  destination:  string;
  checkIn?:     string;
  checkOut?:    string;
  guests?:      string;
  name?:        string;
  email?:       string;
  phone?:       string;
}

function fmtDate(d?: string): string {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { memberId, destination, checkIn, checkOut, guests, name, email, phone } =
    (req.body ?? {}) as BookingPayload;

  if (!destination?.trim()) {
    return res.status(400).json({ error: 'Destination is required' });
  }

  // ── Build HTML email ──────────────────────────────────────────────────────────
  const bodyRows =
    row('Member ID',   memberId    || 'Guest / Not provided') +
    row('Destination', destination) +
    row('Check-in',    fmtDate(checkIn)) +
    row('Check-out',   fmtDate(checkOut)) +
    row('Guests',      guests      || '—') +
    (name  ? row('Name',  name)  : '') +
    (email ? row('Email', `<a href="mailto:${email}" style="color:#b8860b;">${email}</a>`) : '') +
    (phone ? row('Phone', phone) : '');

  const html = emailHtml(
    '🏖️ New Booking Enquiry',
    '#0d3349',
    bodyRows
  );

  const subjectLine = [
    '[Booking Enquiry]',
    destination,
    memberId ? `· Member #${memberId}` : '',
    name     ? `· ${name}`             : '',
  ].filter(Boolean).join(' ');

  // ── Send ─────────────────────────────────────────────────────────────────────
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from:    FROM_LABEL,
      to:      TO_EMAIL,
      replyTo: email ? `${name ?? 'Guest'} <${email}>` : FROM_LABEL,
      subject: subjectLine,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[sendBookingEnquiry]', err);
    return res.status(500).json({
      error: 'Failed to send enquiry. Please try again later.',
    });
  }
}
