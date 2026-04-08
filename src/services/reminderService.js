// src/services/reminderService.js
// Runs daily via cron — sends reminders for appointments scheduled tomorrow
const supabase = require('../config/supabase');
const { sendReminderEmail } = require('./emailService');
const logger = require('../utils/logger');

const sendAppointmentReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow.setHours(0,0,0,0)).toISOString();
  const end   = new Date(tomorrow.setHours(23,59,59,999)).toISOString();

  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*, customer:customers(first_name, last_name, email)')
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)
      .in('status', ['scheduled', 'confirmed'])
      .eq('reminder_sent', false);

    if (error) throw error;

    logger.info(`Reminder job: found ${appointments.length} appointments for tomorrow`);

    const results = await Promise.allSettled(
      appointments.map(async (appt) => {
        if (!appt.customer?.email) return;

        await sendReminderEmail({
          to: appt.customer.email,
          name: `${appt.customer.first_name} ${appt.customer.last_name}`,
          appointment: appt,
        });

        await supabase
          .from('appointments')
          .update({ reminder_sent: true })
          .eq('id', appt.id);
      })
    );

    const sent   = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    logger.info(`Reminder job complete: ${sent} sent, ${failed} failed`);

    return { sent, failed };
  } catch (err) {
    logger.error('Reminder service error', err);
    throw err;
  }
};

module.exports = { sendAppointmentReminders };
