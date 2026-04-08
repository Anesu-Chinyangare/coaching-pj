// ─────────────────────────────────────────
//  src/controllers/leadController.js
// ─────────────────────────────────────────
const supabase = require('../config/supabase');
const { trackEvent } = require('../services/analyticsService');

const getLeads = async (req, res, next) => {
  try {
    const { stage, source, min_score, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('leads')
      .select('*, owner:users(id, name)', { count: 'exact' })
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (stage)     query = query.eq('stage', stage);
    if (source)    query = query.eq('source', source);
    if (min_score) query = query.gte('score', parseInt(min_score));

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({ data, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getLead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*, owner:users(id, name), customer:customers(*)')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Lead not found' });
    res.json({ data });
  } catch (err) { next(err); }
};

const createLead = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...req.body, owner_id: req.user?.id })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('activities').insert({
      entity_type: 'lead', entity_id: data.id,
      user_id: req.user?.id, action: 'created',
      metadata: { source: data.source, stage: data.stage },
    });

    await trackEvent('lead_created', { source: data.source });
    res.status(201).json({ data });
  } catch (err) { next(err); }
};

const updateLead = async (req, res, next) => {
  try {
    const { data: existing } = await supabase.from('leads').select('stage').eq('id', req.params.id).single();

    const { data, error } = await supabase
      .from('leads')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // Track stage progression
    if (req.body.stage && existing?.stage !== req.body.stage) {
      await trackEvent('lead_stage_changed', { from: existing.stage, to: req.body.stage });
      await supabase.from('activities').insert({
        entity_type: 'lead', entity_id: req.params.id,
        user_id: req.user?.id, action: 'stage_changed',
        metadata: { from: existing.stage, to: req.body.stage },
      });
    }

    res.json({ data });
  } catch (err) { next(err); }
};

// Convert lead to customer
const convertLead = async (req, res, next) => {
  try {
    const { data: lead } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .insert({
        first_name: lead.first_name,
        last_name:  lead.last_name,
        email:      lead.email,
        phone:      lead.phone,
        company:    lead.company,
        owner_id:   lead.owner_id,
        status:     'active',
      })
      .select()
      .single();
    if (custErr) throw custErr;

    await supabase.from('leads').update({ stage: 'closed_won', customer_id: customer.id }).eq('id', lead.id);
    await trackEvent('lead_converted', { estimated_value: lead.estimated_value });

    res.status(201).json({ data: customer, message: 'Lead converted to customer' });
  } catch (err) { next(err); }
};

const deleteLead = async (req, res, next) => {
  try {
    const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getLeads, getLead, createLead, updateLead, convertLead, deleteLead };
