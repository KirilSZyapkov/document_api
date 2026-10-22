import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { QrModule } from "../src/qr/qr.module.js";

describe('QR API (e2e)', ()=> {
  let app: INestApplication;

  beforeAll(async ()=> {
    const moduleFixture = await Test.createTestingModule({
      imports: [QrModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    );

    await app.init();
  });

  afterAll(async ()=> {
    await app.close();
  });

  it('POST /v1/qr/generate should return a PNG image', async ()=> {
    const response = await request(app.getHttpServer())
    .post('/v1/qr/generate')
    .send({
      data: 'https://example.com'
    })
    .expect(201)
    .expect('Content-Type', /image\/png/);

    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("POST /v1/qr/generate should reject empty data", async ()=>{
    await request(app.getHttpServer())
    .post('/v1/qr/generate')
    .send({
      data: '',
    })
    .expect(400)
  })
})