// src/services/emailService.js
const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const formatDate = (iso) => {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// ─── Confirmation Email ───────────────────
const sendConfirmationEmail = async ({ to, name, appointment }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Nexus CRM <noreply@nexuscrm.io>',
      to,
      subject: `✅ Appointment Confirmed — ${appointment.title}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
  .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; }
  .header { text-align: center; margin-bottom: 24px; }
  .icon { font-size: 40px; }
  h1 { font-size: 22px; color: #18181b; margin: 12px 0 4px; }
  .subtitle { color: #71717a; font-size: 14px; }
  .detail-box { background: #f4f7fb; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .detail-label { color: #71717a; }
  .detail-value { color: #18181b; font-weight: 500; }
  .footer { text-align: center; font-size: 12px; color: #a1a1aa; margin-top: 24px; }
  .btn { display: inline-block; background: #185FA5; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin: 16px 0; }
</style></head>
<body>
<div class="card">
  <div class="header">
    <div class="icon">📅</div>
    <h1>Appointment Confirmed</h1>
    <p class="subtitle">Hi ${name}, your appointment has been booked.</p>
  </div>
  <div class="detail-box">
    <div class="detail-row"><span class="detail-label">Type</span><span class="detail-value">${appointment.title}</span></div>
    <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${formatDate(appointment.scheduled_at)}</span></div>
    <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${appointment.duration_min} minutes</span></div>
    ${appointment.location ? `<div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${appointment.location}</span></div>` : ''}
    ${appointment.meeting_url ? `<div class="detail-row"><span class="detail-label">Meeting Link</span><span class="detail-value"><a href="${appointment.meeting_url}">${appointment.meeting_url}</a></span></div>` : ''}
  </div>
  ${appointment.meeting_url ? `<div style="text-align:center"><a href="${appointment.meeting_url}" class="btn">Join Meeting</a></div>` : ''}
  <p style="font-size:13px;color:#71717a;text-align:center">Need to reschedule? Reply to this email or contact us.</p>
  <div class="footer">Nexus CRM · Sent automatically</div>
</div>
</body></html>`,
    });
    logger.info(`Confirmation email sent to ${to}`);
  } catch (err) {
    logger.error('Failed to send confirmation email', { to, error: err.message });
  }
};

// ─── Reminder Email ───────────────────────
const sendReminderEmail = async ({ to, name, appointment }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `⏰ Reminder: Your appointment is tomorrow — ${appointment.title}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
  .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; border: 1px solid #e4e4e7; }
  h1 { font-size: 20px; color: #18181b; margin: 0 0 8px; }
  .detail-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
  .detail-label { color: #92400e; }
  .detail-value { color: #78350f; font-weight: 500; }
  .btn { display: inline-block; background: #185FA5; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
  .footer { text-align: center; font-size: 12px; color: #a1a1aa; margin-top: 24px; }
</style></head>
<body>
<div class="card">
  <p style="font-size:14px;color:#71717a">Hi ${name},</p>
  <h1>⏰ Your appointment is coming up!</h1>
  <p style="font-size:14px;color:#52525b">This is a friendly reminder about your scheduled appointment tomorrow.</p>
  <div class="detail-box">
    <div class="detail-row"><span class="detail-label">Appointment</span><span class="detail-value">${appointment.title}</span></div>
    <div class="detail-row"><span class="detail-label">Date & Time</span><span class="detail-value">${formatDate(appointment.scheduled_at)}</span></div>
    <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${appointment.duration_min} minutes</span></div>
    ${appointment.meeting_url ? `<div class="detail-row"><span class="detail-label">Link</span><span class="detail-value"><a href="${appointment.meeting_url}">Join meeting</a></span></div>` : ''}
  </div>
  ${appointment.meeting_url ? `<div style="text-align:center;margin:20px 0"><a href="${appointment.meeting_url}" class="btn">Join Meeting</a></div>` : ''}
  <div class="footer">Nexus CRM · Automated reminder</div>
</div>
</body></html>`,
    });
    logger.info(`Reminder email sent to ${to}`);
  } catch (err) {
    logger.error('Failed to send reminder email', { to, error: err.message });
  }
};

module.exports = { sendConfirmationEmail, sendReminderEmail };
