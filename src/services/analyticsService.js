// src/services/analyticsService.js
// Google Analytics 4 — Measurement Protocol (server-side)
const logger = require('../utils/logger');

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

/**
 * Send a server-side event to GA4 via Measurement Protocol
 * @param {string} eventName
 * @param {object} params
 */
const trackEvent = async (eventName, params = {}) => {
  const measurementId = process.env.GA_MEASUREMENT_ID;
  const apiSecret     = process.env.GA_API_SECRET;

  if (!measurementId || !apiSecret) {
    logger.debug(`GA not configured — skipping event: ${eventName}`);
    return;
  }

  try {
    const url = `${GA_ENDPOINT}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const body = {
      client_id: 'server-side',
      events: [{
        name: eventName,
        params: {
          ...params,
          engagement_time_msec: '100',
          session_id: Date.now().toString(),
        },
      }],
    };

    // Use built-in fetch (Node 18+) or fallback
    const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch');
    const res = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      logger.warn(`GA event failed: ${eventName}`, { status: res.status });
    } else {
      logger.debug(`GA event tracked: ${eventName}`, params);
    }
  } catch (err) {
    logger.warn(`GA tracking error for ${eventName}`, { error: err.message });
    // Never throw — analytics should never break the app
  }
};

/**
 * Track page views from API (useful for server-rendered pages)
 */
const trackPageView = async (path, title) => {
  return trackEvent('page_view', { page_path: path, page_title: title });
};

module.exports = { trackEvent, trackPageView };
