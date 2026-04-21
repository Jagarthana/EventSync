const express = require('express');
const router = express.Router();
const { chatHelp } = require('../controllers/helpAssistantController');

router.post('/chat', chatHelp);

module.exports = router;
