import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-test-app';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /health returns ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('GET /health/ready returns database up', () => {
    return request(app.getHttpServer())
      .get('/health/ready')
      .expect(200)
      .expect((res) => {
        expect(res.body.database).toBe('up');
      });
  });

  it('GET /v1 returns API info', () => {
    return request(app.getHttpServer())
      .get('/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Akan Pay API');
      });
  });
});
