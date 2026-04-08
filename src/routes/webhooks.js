// src/routes/webhooks.js
const express = require('express');
const router  = express.Router();
const logger  = require('../utils/logger');

// POST /api/webhooks/supabase — Supabase database webhooks
router.post('/supabase', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = JSON.parse(req.body);
    logger.info('Supabase webhook received', { type: event.type, table: event.table });

    // Handle different event types
    switch (`${event.type}:${event.table}`) {
      case 'INSERT:appointments':
        logger.info('New appointment created via webhook', { id: event.record?.id });
        break;
      case 'UPDATE:leads':
        if (event.record?.stage === 'closed_won') {
          logger.info('Lead closed won', { id: event.record?.id });
        }
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error('Webhook processing error', err);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;
