/**
 * _mailer.ts — shared Nodemailer transporter + email template helpers.
 * Leading underscore tells Vercel NOT to expose this as an API route.
 */

import * as nodemailer from 'nodemailer';

// ─── Transporter ──────────────────────────────────────────────────────────────
// Credentials come from Vercel Environment Variables (set in dashboard).
export function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      `Missing SMTP env vars — host=${host ?? 'MISSING'} user=${user ?? 'MISSING'} pass=${pass ? 'SET' : 'MISSING'}`
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,   // true for SSL (465), false for TLS (587)
    auth: { user, pass },
    tls: { rejectUnauthorized: false }, // allow self-signed certs on shared hosting
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const TO_EMAIL   = 'Md@clubexotica.in';
// FROM must match the SMTP_USER address — Hostinger rejects mismatched senders
export const FROM_LABEL = `Club Exotica <${process.env.SMTP_USER ?? 'md@clubexotica.in'}>`;

// ─── HTML helpers ─────────────────────────────────────────────────────────────
export function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:9px 14px;font-weight:600;color:#555;width:150px;vertical-align:top;
                 border-bottom:1px solid #f0f0f0;">${label}</td>
      <td style="padding:9px 14px;color:#222;border-bottom:1px solid #f0f0f0;">${value || '—'}</td>
    </tr>`;
}

export function emailHtml(
  title: string,
  headerColor: string,
  bodyRows: string
): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:10px;overflow:hidden;
                      box-shadow:0 4px 18px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:${headerColor};padding:30px 36px;">
              <p style="margin:0;color:rgba(255,255,255,0.70);font-size:12px;
                        letter-spacing:3px;text-transform:uppercase;">Club Exotica</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;
                         line-height:1.3;">${title}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="border:1px solid #e8e8e8;border-radius:8px;
                            border-collapse:collapse;overflow:hidden;">
                ${bodyRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;padding:20px 36px;
                       border-top:1px solid #ececec;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                This email was generated automatically from the Club Exotica website.<br>
                Do not reply — contact the customer via the details shown above.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
