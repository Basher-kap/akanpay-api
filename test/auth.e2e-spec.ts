import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './create-test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const username = `user_${Date.now()}`;
  const password = 'Password1a';
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('POST /v1/auth/register creates user and returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ name: 'Test User', username, password })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('POST /v1/auth/login returns tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ username, password })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('GET /v1/auth/profile returns JWT payload', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.username).toBe(username);
    expect(res.body.sub).toBeDefined();
  });

  it('POST /v1/auth/refresh rotates tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    accessToken = res.body.access_token;
    refreshToken = res.body.refresh_token;
  });

  it('POST /v1/auth/logout invalidates session', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/v1/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
