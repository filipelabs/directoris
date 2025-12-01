import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env with override to ensure file values take precedence over shell env
dotenv.config({ path: resolve(process.cwd(), '.env'), override: true });

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  workos: {
    apiKey: process.env.WORKOS_API_KEY,
    clientId: process.env.WORKOS_CLIENT_ID,
    cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  agentos: {
    url: process.env.AGENTOS_URL,
    apiKey: process.env.AGENTOS_API_KEY,
  },
});
