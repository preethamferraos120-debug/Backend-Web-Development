'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;

  // Reject missing/malformed signatures and missing secrets before comparing.
  const match = typeof signature === 'string'
    ? signature.match(/^sha256=([a-f0-9]{64})$/i)
    : null;

  if (!match || !secret || !Buffer.isBuffer(req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Sign the exact raw request bytes; parsing or re-serialising changes them.
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest();
  const received = Buffer.from(match[1], 'hex');

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // Mark before acknowledging so concurrent/retried deliveries are deduplicated.
  _processedIds.add(event.id);

  res.status(200).json({ status: 'received' });

  // Acknowledge immediately; do the potentially slow work after the response.
  setImmediate(() => {
    Promise.resolve(handleEvent(event)).catch((error) => {
      console.error('[webhook] Event processing failed:', error);
    });
  });
}

module.exports = { handleWebhook, _processedIds };
