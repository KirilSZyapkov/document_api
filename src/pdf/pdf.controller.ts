import { Controller, Body, Header, HttpCode, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PdfService } from './pdf.service.js';
import { GeneratePdfDto } from './dto/generate-pdf.dto.js';

@ApiTags('PDF')
@Controller('v1/pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService){}

  @Post('generate')
  @HttpCode(200)
  @ApiConsumes('application/json')
  @ApiProduces('application/pdf')
  @ApiBody({
    type: GeneratePdfDto,
    examples: {
      basic: {
        summary: 'Generate a PDF from HTML',
        value: {
          html: '<h1>Hello World</h1><p>My first PDF document.</p>'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Generate PDF document.',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid HTML input'
  })
  async generate(@Body() dto: GeneratePdfDto, @Res() res: Response):Promise<void> {
    const pdf = await this.pdfService.generate(dto.html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length.toString(),
      'Content-Disposition': 'attachment; filename="document.pdf"'
    });

    res.send(pdf);
  }
}
