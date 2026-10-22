import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async generate(data: string, width = 300, margin = 2): Promise<Buffer>{
    return QRCode.toBuffer(data, {
      type: 'png',
      width,
      margin,
    })
  }
}
