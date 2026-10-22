import { INestApplication, ValidationPipe } from "@nestjs/common";
import {Test} from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { BarcodeModule } from "../src/barcode/barcode.module.js";

describe('Barcode API (e2e)', ()=> {
  let app: INestApplication;

  beforeAll(async ()=> {
    const moduleFixture = await Test.createTestingModule({
      imports:[BarcodeModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    );

    app.init();
  });

  afterAll(async ()=>{
    await app.close();
  });

  it('POST /v1/barcode/generate should return a Code 128 PNG image', async ()=> {
    const response = await request(app.getHttpServer())
    .post('/v1/barcode/generate')
    .send({
      text: "Hello-123",
      format: "code128"
    })
    .expect(201)
    .expect('Content-Type',/image\/png/);

    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0)
  });

  it('POST /v1/barcode/generate shuold return an EAN-13 PNG image', async ()=> {
    const response = await request(app.getHttpServer())
    .post('/v1/barcode/generate')
    .send({
      text: '5901234123457',
      format: 'ean13'
    })
    .expect(201)
    .expect('Content-Type', /image\/png/)

    expect(response.body).toBeInstanceOf(Buffer);
    expect(response.body.length).toBeGreaterThan(0);
  });


  it('POST /v1/barcode/generate should reject invalid EAN-13 data', async ()=> {
    await request(app.getHttpServer())
    .post('/v1/barcode/generate')
    .send({
      text: '1234567890123',
      format: 'ean13'
    })
    expect(400)
  })
})