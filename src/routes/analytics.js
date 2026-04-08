// src/routes/analytics.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/analyticsController');

router.get('/dashboard', authenticate, ctrl.getDashboardStats);
router.get('/pipeline',  authenticate, ctrl.getPipelineStats);
router.get('/revenue',   authenticate, ctrl.getRevenueByMonth);
router.post('/track',    ctrl.trackClientEvent); // public — no auth needed

module.exports = router;
