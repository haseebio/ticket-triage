require('dotenv').config();

// Fail fast if a secret is missing, rather than limping along with `undefined`.
const required = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length && process.env.NODE_ENV !== 'test') {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  llm: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    maxRequestsPerMinute: Number(process.env.LLM_MAX_REQUESTS_PER_MINUTE) || 10,
    maxRequestsPerDay: Number(process.env.LLM_MAX_REQUESTS_PER_DAY) || 800,
  },
};
