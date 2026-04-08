// src/routes/customers.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/customerController');

router.get('/',      authenticate, ctrl.getCustomers);
router.get('/:id',   authenticate, ctrl.getCustomer);
router.post('/',     authenticate, ctrl.createCustomer);
router.patch('/:id', authenticate, ctrl.updateCustomer);
router.delete('/:id',authenticate, ctrl.deleteCustomer);

module.exports = router;
