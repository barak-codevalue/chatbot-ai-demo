import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicAdminAuthGuard implements CanActivate {
  private readonly adminPassword: string;
  private readonly adminUsername: string;
  constructor(private readonly configService: ConfigService) {
    this.adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    this.adminUsername = this.configService.get<string>('ADMIN_USERNAME');
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { headers } = request;

    const authorization = headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [username, password] = this.parseAuthorizationHeader(authorization);

    if (username === this.adminUsername && password === this.adminPassword) {
      return true;
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  private parseAuthorizationHeader(authorization: string): [string, string] {
    const parts = authorization.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Basic') {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const credentials = Buffer.from(parts[1], 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw new UnauthorizedException('Invalid Authorization header content');
    }

    return [username, password];
  }
}
