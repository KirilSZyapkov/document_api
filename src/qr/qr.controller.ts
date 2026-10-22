import {Body, Post, Controller, Res } from '@nestjs/common';
import { ApiBody, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { GenerateQrDto } from './dto/generate-qr.dto.js';
import type { Response } from 'express';
import { QrService } from './qr.service.js';

@Controller('v1/qr')
export class QrController {
  constructor(private readonly qrService: QrService){}

  @ApiBody({
    schema:{
      type: 'object',
      properties:{
        data: {
          type: 'string',
          example: 'https://example.com',
          description: 'Text or URL to encode into the QR code.'
        },
        width: {
          type: 'integer',
          minimum: 100,
          maximum: 2000,
          example: 500,
          description: 'Width and height of the generated QR code in pixels.'
        },
        margin: {
          type: 'integer',
          minimum: 0,
          maximum: 20,
          example: 4,
          description: 'Margin around the QR code.',
        }
      },
      required: ['data']
    }
  })

  @ApiProduces('image/png')
  @ApiResponse({
    status: 200,
    description: 'Generated QR code as a PNG image.',
    content: {
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })

  @Post('generate')
  async generate(@Body() dto: GenerateQrDto, @Res() res: Response) {
    const qrCode = await this.qrService.generate(dto.data, dto.width, dto.margin);
    
    res.set({
      'Content-Type': 'image/png',
      'Content-Length':qrCode.length,
    });

    res.send(qrCode);
  }
}
