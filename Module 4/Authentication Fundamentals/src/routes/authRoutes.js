const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message },
      });
    }
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await authService.login(req.body);
    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof authService.AuthError) {
      return res.status(error.status).json({
        error: { code: error.code, message: error.message },
      });
    }
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

module.exports = router;
