// ─────────────────────────────────────────
//  src/controllers/appointmentController.js
// ─────────────────────────────────────────
const supabase = require("../config/supabase");
const logger = require("../utils/logger");

const getAppointments = async (req, res, next) => {
  try {
    const {
      status,
      date_from,
      date_to,
      customer_id,
      page = 1,
      limit = 20,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .order("scheduled_at", { ascending: true })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq("status", status);
    if (customer_id) query = query.eq("customer_id", customer_id);
    if (date_from) query = query.gte("scheduled_at", date_from);
    if (date_to) query = query.lte("scheduled_at", date_to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getAppointment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Appointment not found" });
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const {
      customer_id,
      title,
      type,
      scheduled_at,
      duration_min = 60,
      location,
      meeting_url,
      notes,
    } = req.body;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        customer_id,
        title,
        type,
        scheduled_at,
        duration_min,
        location,
        meeting_url,
        notes,
        owner_id: req.user?.id,
        status: "scheduled",
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("activities").insert({
      entity_type: "appointment",
      entity_id: data.id,
      user_id: req.user?.id,
      action: "created",
      metadata: { type, scheduled_at },
    });

    logger.info(`Appointment created: ${data.id}`);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const sendReminder = async (req, res, next) => {
  res.json({ message: "Reminder noted" });
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  sendReminder,
};
