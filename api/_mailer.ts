/**
 * _mailer.ts — shared Nodemailer transporter + email template helpers.
 * Uses Gmail SMTP with an App Password — works reliably from Vercel.
 *
 * Required environment variables (set in Vercel dashboard):
 *   GMAIL_USER  — the Gmail address (e.g. clubexotica12@gmail.com)
 *   GMAIL_PASS  — the 16-char Google App Password (spaces are stripped automatically)
 */

import * as nodemailer from 'nodemailer';

// ─── Transporter ──────────────────────────────────────────────────────────────
export function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = (process.env.GMAIL_PASS ?? '').replace(/\s+/g, ''); // strip spaces

  if (!user || !pass) {
    throw new Error(
      `Missing env vars — GMAIL_USER=${user ?? 'MISSING'} GMAIL_PASS=${pass ? 'SET' : 'MISSING'}`
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const TO_EMAIL   = 'md@clubexotica.in';
export const FROM_LABEL = `Club Exotica <${process.env.GMAIL_USER ?? 'clubexotica12@gmail.com'}>`;

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
