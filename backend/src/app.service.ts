import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiDocumentation() {
    return {
      message: 'Health Insurance Policy Management API',
      version: '2.0.0',
      framework: 'NestJS',
      endpoints: {
        health: 'GET /health',
        policies: {
          list: 'GET /api/policies',
          get: 'GET /api/policies/:id',
          create: 'POST /api/policies',
          update: 'PUT /api/policies/:id',
          delete: 'DELETE /api/policies/:id',
          renew: 'POST /api/policies/:id/renew',
          cancel: 'POST /api/policies/:id/cancel',
        },
      },
    };
  }

  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Health Insurance Policy API',
      framework: 'NestJS',
    };
  }
}
