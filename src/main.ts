import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import express from 'express';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(express.json({limit: '200kb'}));
  app.use(express.urlencoded({extended: true, limit:'200kb'}));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Document API')
    .setDescription(
      'API for generating and processing PDF documents, QR codes and barcodes.'
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number>('PORT') ?? 3000);

  if(!Number.isInteger(port) || port <1 || port > 65535) {
    throw new Error('PORT must be a valid integer between 1 and 65535');
  };

  await app.listen(port, () => console.log("Server running on port: http://localhost:3000/"));
}
await bootstrap();
