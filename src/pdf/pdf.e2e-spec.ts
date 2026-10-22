import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PdfModule } from "./pdf.module.js";
import express from 'express';

describe('PDF API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [PdfModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bodyParser: false
    });

    app.use(express.json({limit: '200kb'}));
    app.use(express.urlencoded({extended: true, limit:'200kb'}));

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    );

    await app.init();
  });

  afterAll(async () => { await app.close() });

  // it('POST /v1/pdf/generate should return a PDF document', async () => {
  //   const response = await request(app.getHttpServer())
  //     .post('/v1/pdf/generate')
  //     .buffer(true)
  //     .parse((stream, callback) => {
  //       const chunks: Buffer[] = [];

  //       stream.on('data', (chunk: Buffer) => {
  //         chunks.push(Buffer.from(chunk));
  //       });

  //       stream.on('error', (error: Error) => {
  //         callback(error, Buffer.alloc(0));
  //       });
  //     })
  //     .send({
  //       html: '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
  //     })
  //     .expect(200)
  //     .expect('Content-Type', /application\/pdf/);

  //   expect(Buffer.isBuffer(response.body)).toBe(true);
  //   expect(response.body.length).toBeGreaterThan(0);
  //   expect(response.body.subarray(0, 5).toString()).toBe('%PDF-');
  // }, 30000);

  it('POST /v1/pdf/generate should return a PDF document', async () => {
    const response = await request(app.getHttpServer())
      .post('/v1/pdf/generate')
      .send({
        html: '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
      })
      .expect(200)
      .expect('Content-Type', /application\/pdf/)
      .expect('Content-Disposition','attachment; filename="document.pdf"')
      .expect('Content-Length', /^\d+$/);

    expect(response.body).toBeDefined();
  }, 30000);

  it('POST /v1/pdf/generate should reject empty HTML', async () => {
    await request(app.getHttpServer())
      .post('/v1/pdf/generate')
      .send({
        html: ''
      })
      .expect(400)
  });

  it('POST /v1/pdf/generate should reject HTML exceeding the size limit', async ()=> {
    const oversizeHTML = 'a'.repeat(100001);

    await request(app.getHttpServer())
    .post('/v1/pdf/generate')
    .send({
      html: oversizeHTML
    })
    .expect(400)
  });

  it('should reject requests exceeding the body size limit', async ()=> {
    const oversizeHtml = 'A'.repeat(250000);

    const response = await request(app.getHttpServer())
    .post('/v1/pdf/generate')
    .send({html: oversizeHtml});

    expect(response.status).toBe(413);
  });
  
});