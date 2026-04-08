// src/routes/leads.js
const express = require('express');
const router  = express.Router();
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/leadController');

const leadValidation = [
  body('first_name').trim().notEmpty(),
  body('last_name').trim().notEmpty(),
  body('source').optional().isIn(['website','referral','linkedin','cold_outreach','event','other']),
  body('score').optional().isInt({ min: 0, max: 100 }),
];

router.get('/',            authenticate, ctrl.getLeads);
router.get('/:id',         authenticate, ctrl.getLead);
router.post('/',           authenticate, leadValidation, validate, ctrl.createLead);
router.patch('/:id',       authenticate, ctrl.updateLead);
router.post('/:id/convert',authenticate, ctrl.convertLead);
router.delete('/:id',      authenticate, ctrl.deleteLead);

module.exports = router;
