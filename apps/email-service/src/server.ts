// AFP Finance App - Email Service Server
import Fastify from 'fastify';
import type { 
  ApiResponse, 
  ProcessEmailsRequest, 
  ProcessEmailsResponse
} from '@afp/shared-types';

const fastify = Fastify({
  logger: true
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Test endpoint using shared types
fastify.post<{
  Body: ProcessEmailsRequest;
  Reply: ApiResponse<ProcessEmailsResponse>;
}>('/process-emails', async (request) => {
  const { user_id } = request.body;
  
  // TODO: Implement email processing logic
  console.log('Processing emails for user:', user_id);
  
  return {
    success: true,
    data: {
      processed_count: 0,
      new_transactions: 0,
      errors: [],
      processing_time_ms: 100
    }
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
