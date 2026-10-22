import { Module } from '@nestjs/common';
import { BarcodeService } from './barcode.service.js';
import { BarcodeController } from './barcode.controller.js';

@Module({
  providers: [BarcodeService],
  controllers: [BarcodeController]
})
export class BarcodeModule {}
