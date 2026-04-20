const supabase = require('../config/supabase');

const getCustomers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let query = supabase.from('customers').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    const { data, error, count } = await query;
    if (error) throw error;
    res.json({ data, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [customerRes, appointmentsRes, leadsRes, activitiesRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('appointments').select('*').eq('customer_id', id).order('scheduled_at', { ascending: false }).limit(10),
      supabase.from('leads').select('*').eq('customer_id', id),
      supabase.from('activities').select('*').eq('entity_type', 'customer').eq('entity_id', id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (customerRes.error) return res.status(404).json({ error: 'Customer not found' });
    res.json({ data: { ...customerRes.data, appointments: appointmentsRes.data || [], leads: leadsRes.data || [], activities: activitiesRes.data || [] } });
  } catch (err) { next(err); }
};

const createCustomer = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('customers').insert({ ...req.body, owner_id: req.user?.id }).select().single();
    if (error) throw error;
    await supabase.from('activities').insert({ entity_type: 'customer', entity_id: data.id, user_id: req.user?.id, action: 'created' });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('customers').update({ ...req.body, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ data });
  } catch (err) { next(err); }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const { error } = await supabase.from('customers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
