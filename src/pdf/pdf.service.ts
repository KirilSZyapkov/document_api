import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException, GatewayTimeoutException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

@Injectable()
export class PdfService {

  private readonly logger = new Logger(PdfService.name);
  private activeGenerations = 0;
  private readonly maxConcurrentGenerations = 2;
  private readonly generationTimeoutMs = 30000;
  private readonly browserLaunchTimeoutMs = 10000;

  async generate(html: string): Promise<Buffer> {
    if (this.activeGenerations >= this.maxConcurrentGenerations) {
      throw new ServiceUnavailableException(
        'PDF generation capacity reached. Please try again later.'
      )
    }
    this.activeGenerations++;

    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let timedOut = false;

    try {
      const generation = (async (): Promise<Buffer> => {

        if(process.env.VERCEL === '1'){
          browser = await puppeteerCore.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
            timeout: this.browserLaunchTimeoutMs,
            //args: ['--no-sandbox', '--disable-setuid-sandbox']
          });

        } else {
           browser = await puppeteer.launch({
            headless: true,
            timeout: this.browserLaunchTimeoutMs,
            //args: ['--no-sandbox', '--disable-setuid-sandbox']
          });
        }

        if(timedOut) {
          await browser.close();
          throw new Error('PDF generation time out.')
        }

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        
        page.on('request', (request) => {
          const url = request.url();
  
          if (
            url.startsWith('data:') ||
            url.startsWith('blob:') ||
            url === 'about:blank'
          ) {
            void request.continue();
          } else {
            void request.abort();
          }
        });


        
              await page.setContent(html, {
                waitUntil: 'load',
                timeout: 15000,
              });
        
              const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                preferCSSPageSize: true
              })
        
              return Buffer.from(pdf);
      })();

      const timeout = new Promise<never>((_, reject)=> {
        timeoutId = setTimeout(()=> {
          timedOut = true;

          reject(new Error('PDF generation timed out.'));

          if(browser){
            void browser.close().catch((error: unknown)=> {
              this.logger.error(
                'Failed to stop timed-out Puppeteer browser.',
                error instanceof Error ? error.stack : String(error),
              );
            });
          }
        }, this.generationTimeoutMs);
      });

      return await Promise.race([generation, timeout]);

    } catch (error) {
      if(timedOut) {
        throw new GatewayTimeoutException(
          'PDF generation timed out. Please try again.'
        );
      }

      throw new InternalServerErrorException (
        'Failed to generate PDF document.'
      )
    } finally {
      if(timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          this.logger.error(
            'Failed to close Puppeteer browser.',
            error instanceof Error ? error.stack : String(error)
          )

        }
      }
      this.activeGenerations--;
    }
  }
}
