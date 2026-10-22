import { QrService } from "./qr.service.js";

describe('QrService', ()=> {
  let service: QrService;

  beforeEach(()=> {
    service = new QrService();
  });

  it('should generate a QR code with default options', async ()=> {
    const result = await service.generate('https://example.com');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate a QR code with custom options', async ()=> {
    const result = await service.generate(
      'https://example.com',
      500,
      4
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0)
  })
})