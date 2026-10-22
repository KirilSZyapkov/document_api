import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBody, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { GenerateBarcodeDto } from './dto/generate-barcode.dto.js';
import { BarcodeService } from './barcode.service.js';

@Controller('v1/barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) { }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          example: '123456789',
          description: 'Text or number to encode into the barcode.',
        },
        format: {
          type: 'string',
          enum: ['code128', 'ean13'],
          example: 'code128',
          description: 'Barcode format',
        },
        scale: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          example: 3,
          description: 'Barcode scale',
        },
        height: {
          type: 'integer',
          minimum: 5,
          maximum: 200,
          example: 10,
          description: 'Barcode height.'
        }
      },
      required: ['text']
    }
  })
  @ApiProduces('image/png')
  @ApiResponse({
    status: 200,
    description: 'Generated barcode as a PNG image.',
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
  async generate(@Body() dto: GenerateBarcodeDto, @Res() res: Response) {
    const barcode = await this.barcodeService.generate(
      dto.text,
      dto.scale,
      dto.height,
      dto.format
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': barcode.length
    });

    res.send(barcode);
  }
}
