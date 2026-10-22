import { Injectable, BadRequestException } from '@nestjs/common';
import bwipjs from 'bwip-js';

@Injectable()
export class BarcodeService {
  async generate(text: string, scale = 3, height = 10, format = 'code128'): Promise<Buffer> {
    try {
      
      return await bwipjs.toBuffer({
        bcid: format,
        text,
        scale,
        height,
        includetext: true
      })
    } catch (error) {
      throw new BadRequestException(
        `Invalid data for barcode format: ${format}.`,
      )
    }
  }
}
