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
});
