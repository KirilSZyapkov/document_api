import { BadRequestException } from "@nestjs/common";
import { BarcodeService } from "./barcode.service.js";

describe('BarcodeService', ()=>{
  let service: BarcodeService;

  beforeEach(()=> {
    service = new BarcodeService();
  });

  it('should generate a Code 128 barcode', async ()=> {
    const result = await service.generate(
      'HELLO-123',
      10,
      20,
      'code128'
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate an EAN-13 barcode', async ()=> {
    const result = await service.generate(
      '5901234123457',
      10,
      20,
      'ean13'
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should throw BadRequestException for invalid barcode data', async ()=> {
    await expect(
      service.generate(
        '1234567890123',
        10,
        20,
        'ean13',
      )
    ).rejects.toThrow(BadRequestException);
  })

})