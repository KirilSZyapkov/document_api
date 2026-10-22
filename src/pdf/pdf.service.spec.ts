import { beforeAll, describe, expect, it } from "vitest";
import { ServiceUnavailableException } from "@nestjs/common";
import { PdfService } from "./pdf.service.js";
import { AddressInfo } from "node:net";
import { createServer, type Server } from "node:http";
import puppeteer from "puppeteer";

describe('PdfService', () => {
  let service: PdfService;

  beforeAll(() => { service = new PdfService() });

  it('should generate a PDF from HTML', async () => {
    const result = await service.generate(
      '<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>',
    );

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result.subarray(0, 5).toString()).toBe('%PDF-');
  }, 30000);

  it('should block external HTTP request', async () => {
    let requestReceived = false;

    const server: Server = createServer((_req, res) => {
      requestReceived = true,
        res.end('test');
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve)
    });

    try {
      const address = server.address() as AddressInfo;
      const url = `http://127.0.0.1:${address.port}/test`;

      const result = await service.generate(`
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Security test</h1>
            <img src="${url}" />
          </body>
        </html>
        `);

      expect(result.subarray(0, 5).toString()).toBe('%PDF-');
      expect(requestReceived).toBe(false);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        })
      })
    }
  }, 30000);

  it('should reject PDF generation when capacity is reached', async () => {
    Object.assign(service, { activeGenerations: 2 });

    try {
      await expect(
        service.generate('<html><body><h1>Test</h1></body></html>'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException)
    } finally {
      Object.assign(service, { activeGenerations: 0 });
    }
  });

  it('should release capacity after successful PDF generation', async () => {
    const result = await service.generate('<!DOCTYPE html><html><body><h1>Capacity test</h1></body></html>')

    expect(result.subarray(0, 5).toString()).toBe('%PDF-');
    expect(
      (service as unknown as { activeGenerations: number }).activeGenerations
    ).toBe(0)
  }, 30000);

  it('should release capacity after PDF generation fails', async () => {
    const originalLaunch = puppeteer.launch;

    try {
      puppeteer.launch = (() => Promise.reject(new Error('Simulated browse launch failure'))) as typeof puppeteer.launch;

      await expect(
        service.generate('<html><body>Test</body></html>'),
      ).rejects.toThrow('Failed to generate PDF document.');

      expect(
        (service as unknown as { activeGenerations: number }).activeGenerations,
      ).toBe(0)

    } finally {
      puppeteer.launch = originalLaunch;
    }
  });
})