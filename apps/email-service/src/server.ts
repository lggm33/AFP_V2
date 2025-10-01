// AFP Finance App - Email Service Server (Minimal Version)
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true,
});

// Health check endpoint
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    service: 'email-service',
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  };
});

// Simple hello endpoint
fastify.get('/', async () => {
  return { 
    message: 'AFP Email Service is running!',
    version: '1.0.0',
    endpoints: ['/health', '/']
  };
});

// Simple test endpoint (no complex types)
fastify.post('/test', async (request) => {
  return {
    success: true,
    message: 'Email service is working!',
    received: request.body,
    timestamp: new Date().toISOString()
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Email service running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
