// ─────────────────────────────────────────
//  src/controllers/analyticsController.js
// ─────────────────────────────────────────
const supabase = require('../config/supabase');

const getDashboardStats = async (req, res, next) => {
  try {
    const now      = new Date();
    const today    = new Date(now.setHours(0,0,0,0)).toISOString();
    const weekAgo  = new Date(Date.now() - 7 * 864e5).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString();

    const [
      todayAppts, newLeads, totalCustomers,
      completedAppts, noShows, revenueData
    ] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact' }).gte('scheduled_at', today),
      supabase.from('leads').select('id', { count: 'exact' }).gte('created_at', weekAgo),
      supabase.from('customers').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'completed').gte('scheduled_at', monthAgo),
      supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'no_show').gte('scheduled_at', monthAgo),
      supabase.from('customers').select('total_spent').eq('status', 'active'),
    ]);

    const totalRevenue = (revenueData.data || []).reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const total = (completedAppts.count || 0) + (noShows.count || 0);
    const noShowRate = total > 0 ? Math.round((noShows.count / total) * 100) : 0;

    res.json({
      data: {
        today_appointments: todayAppts.count || 0,
        new_leads_week:     newLeads.count   || 0,
        active_customers:   totalCustomers.count || 0,
        monthly_revenue:    totalRevenue,
        no_show_rate:       noShowRate,
        completed_this_month: completedAppts.count || 0,
      }
    });
  } catch (err) { next(err); }
};

const getPipelineStats = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('stage, estimated_value');
    if (error) throw error;

    const stages = ['new','discovery','qualified','proposal','closed_won','closed_lost'];
    const pipeline = stages.map(stage => {
      const leads = data.filter(l => l.stage === stage);
      return {
        stage,
        count: leads.length,
        value: leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0),
      };
    });

    res.json({ data: pipeline });
  } catch (err) { next(err); }
};

const getRevenueByMonth = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('scheduled_at, customer:customers(total_spent)')
      .eq('status', 'completed')
      .gte('scheduled_at', new Date(Date.now() - 180 * 864e5).toISOString());
    if (error) throw error;

    // Group by month
    const monthly = {};
    (data || []).forEach(appt => {
      const month = new Date(appt.scheduled_at).toISOString().slice(0,7);
      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += appt.customer?.total_spent || 0;
    });

    res.json({ data: Object.entries(monthly).map(([month, revenue]) => ({ month, revenue })) });
  } catch (err) { next(err); }
};

// POST /api/analytics/track — receive frontend events
const trackClientEvent = async (req, res, next) => {
  try {
    const { event_name, event_data, session_id } = req.body;

    await supabase.from('analytics_events').insert({
      event_name, event_data, session_id,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip,
    });

    res.status(202).json({ message: 'Event tracked' });
  } catch (err) { next(err); }
};

// SEO sitemap controller
const sitemap = (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://nexuscrm.io';
  const pages = ['', '/features', '/pricing', '/about', '/contact'];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${baseUrl}${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
  res.type('application/xml').send(xml);
};

module.exports = { getDashboardStats, getPipelineStats, getRevenueByMonth, trackClientEvent, sitemap };
