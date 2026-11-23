'use strict';

// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow up to 5 failed attempts per IP in each window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  // For a multi-instance deployment, replace the default in-memory store
  // with rate-limit-redis configured with a shared Redis client. Each server
  // instance has its own in-memory counters, so a load balancer can send
  // requests from the same IP to different instances and let that IP exceed
  // the intended limit. Redis shares the counters across all instances.
});

module.exports = authLimiter;
