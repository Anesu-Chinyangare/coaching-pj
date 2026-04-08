// ─────────────────────────────────────────
//  src/routes/appointments.js
// ─────────────────────────────────────────
const express = require('express');
const router  = express.Router();
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/appointmentController');

const apptValidation = [
  body('customer_id').isUUID(),
  body('title').trim().notEmpty(),
  body('type').isIn(['consultation','follow_up','demo','strategy','proposal','other']),
  body('scheduled_at').isISO8601(),
  body('duration_min').optional().isInt({ min: 15, max: 480 }),
];

router.get('/',     authenticate, ctrl.getAppointments);
router.get('/:id',  authenticate, param('id').isUUID(), validate, ctrl.getAppointment);
router.post('/',    authenticate, apptValidation, validate, ctrl.createAppointment);
router.patch('/:id',authenticate, param('id').isUUID(), validate, ctrl.updateAppointment);
router.delete('/:id',authenticate,param('id').isUUID(), validate, ctrl.deleteAppointment);
router.post('/:id/remind', authenticate, ctrl.sendReminder);

module.exports = router;
