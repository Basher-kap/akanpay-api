import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_ANONYMOUS } from 'src/decorators';

import { UserService } from 'src/user/user.service';

type JwtPayload = {
  sub: number;
  username: string;
  roles: string[];
  tokenVersion: number;
  jti?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAnonymous = this.reflector.getAllAndOverride<boolean>(
      IS_ANONYMOUS,
      [context.getHandler(), context.getClass()],
    );
    if (isAnonymous) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    let payload: JwtPayload;
    try {
      // 💡 Here the JWT secret key that's used for verifying the payload
      // is the key that was passed in the JwtModule
      payload = await this.jwtService.verifyAsync(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException();
    }

    request['user'] = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
