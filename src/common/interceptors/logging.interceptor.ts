import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

const SENSITIVE_PATHS = [
  '/auth/login',
  '/auth/register',
  '/v1/auth/login',
  '/v1/auth/register',
];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const started = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - started;
        const path = originalUrl.split('?')[0];
        const isSensitive = SENSITIVE_PATHS.some(
          (p) => path.endsWith(p.replace('/v1', '')) || path.includes(p),
        );

        this.logger.log(
          `${method} ${path} ${response.statusCode} ${duration}ms${isSensitive ? ' [body omitted]' : ''}`,
        );
      }),
    );
  }
}
