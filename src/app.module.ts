import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { QrModule } from './qr/qr.module.js';
import { BarcodeModule } from './barcode/barcode.module.js';
import { PdfModule } from './pdf/pdf.module.js';
import {APP_GUARD} from '@nestjs/core';
import { RapidApiGuard } from './common/rapidapi.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    QrModule,
    BarcodeModule,
    PdfModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: RapidApiGuard
    }
  ],
})
export class AppModule {}
