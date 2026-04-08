// ─────────────────────────────────────────
//  src/controllers/appointmentController.js
// ─────────────────────────────────────────
const supabase  = require('../config/supabase');
const { sendConfirmationEmail } = require('../services/emailService');
const { trackEvent }            = require('../services/analyticsService');
const logger                    = require('../utils/logger');

// GET /api/appointments
const getAppointments = async (req, res, next) => {
  try {
    const { status, date_from, date_to, customer_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('appointments')
      .select(`
        *,
        customer:customers(id, first_name, last_name, email, phone),
        owner:users(id, name, email)
      `, { count: 'exact' })
      .order('scheduled_at', { ascending: true })
      .range(offset, offset + parseInt(limit) - 1);

    if (status)      query = query.eq('status', status);
    if (customer_id) query = query.eq('customer_id', customer_id);
    if (date_from)   query = query.gte('scheduled_at', date_from);
    if (date_to)     query = query.lte('scheduled_at', date_to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
const getAppointment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`*, customer:customers(*), owner:users(id, name, email)`)
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments
const createAppointment = async (req, res, next) => {
  try {
    const {
      customer_id, lead_id, title, type, scheduled_at,
      duration_min = 60, location, meeting_url, notes, send_confirmation = true
    } = req.body;

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        customer_id, lead_id, title, type, scheduled_at,
        duration_min, location, meeting_url, notes,
        owner_id: req.user?.id,
        status: 'scheduled',
      })
      .select(`*, customer:customers(*)`)
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from('activities').insert({
      entity_type: 'appointment',
      entity_id: data.id,
      user_id: req.user?.id,
      action: 'created',
      metadata: { type, scheduled_at },
    });

    // Send confirmation email
    if (send_confirmation && data.customer?.email) {
      await sendConfirmationEmail({
        to: data.customer.email,
        name: `${data.customer.first_name} ${data.customer.last_name}`,
        appointment: data,
      });
    }

    // Track in GA
    await trackEvent('appointment_created', { type, duration_min });

    logger.info(`Appointment created: ${data.id}`);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/appointments/:id
const updateAppointment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select(`*, customer:customers(*)`)
      .single();

    if (error) throw error;

    await supabase.from('activities').insert({
      entity_type: 'appointment',
      entity_id: req.params.id,
      user_id: req.user?.id,
      action: 'updated',
      metadata: req.body,
    });

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/appointments/:id
const deleteAppointment = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments/:id/remind
const sendReminder = async (req, res, next) => {
  try {
    const { data: appt, error } = await supabase
      .from('appointments')
      .select(`*, customer:customers(*)`)
      .eq('id', req.params.id)
      .single();

    if (error || !appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!appt.customer?.email) return res.status(400).json({ error: 'Customer has no email' });

    const { sendReminderEmail } = require('../services/emailService');
    await sendReminderEmail({
      to: appt.customer.email,
      name: `${appt.customer.first_name} ${appt.customer.last_name}`,
      appointment: appt,
    });

    await supabase
      .from('appointments')
      .update({ reminder_sent: true })
      .eq('id', req.params.id);

    res.json({ message: 'Reminder sent successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, sendReminder };
