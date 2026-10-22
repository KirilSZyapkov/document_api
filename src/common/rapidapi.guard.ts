import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { timingSafeEqual } from "node:crypto";

@Injectable()
export class RapidApiGuard implements CanActivate {
  constructor (private readonly configService: ConfigService){}

  canActivate(context: ExecutionContext):boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if(!request.path.startsWith('/v1/')) {
      return true;
    };

    const expectedSecret = this.configService.get<string>('RAPIDAPI_PROXY_SECRET');

    if(!expectedSecret){
      if(this.configService.get<string>('NODE_ENV') === 'production') {
        throw new InternalServerErrorException('API authentication is not configured.')
      };

      return true;
    }

    const receivedSecret = request.headers['x-rapidapi-proxy-secret'];

    if(typeof receivedSecret !=='string' || receivedSecret.length !== expectedSecret.length) {
      throw new UnauthorizedException('Invalid API credentials.');
    };

    const receivedBuffer = Buffer.from(receivedSecret, 'utf8');
    const expectedBuffer = Buffer.from(expectedSecret, 'utf8');

    if(!timingSafeEqual(receivedBuffer, expectedBuffer)){
      throw new UnauthorizedException('Invalid API credentials.')
    }

    return true;
  }
}