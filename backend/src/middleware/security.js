const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

const corsOptions = {
  origin: env.corsOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = [helmet(), cors(corsOptions)];
