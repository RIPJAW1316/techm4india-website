import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';
import { SENSITIVE_FIELDS } from '../constants';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithCorrelationId>();
    const response = ctx.getResponse<Response>();

    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') || 'Unknown';
    const correlationId = request.correlationId || 'N/A';
    const startTime = Date.now();

    const sanitizedBody = this.sanitize(request.body);
    const sanitizedQuery = this.sanitize(request.query);

    this.logger.log(
      `--> [${correlationId}] ${method} ${originalUrl} IP: ${ip} Agent: "${userAgent}" Query: ${JSON.stringify(
        sanitizedQuery,
      )} Body: ${JSON.stringify(sanitizedBody)}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;
          this.logger.log(
            `<-- [${correlationId}] ${method} ${originalUrl} ${statusCode} [${duration}ms]`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const statusCode = err?.status || err?.statusCode || 500;
          this.logger.error(
            `<-- [${correlationId}] ${method} ${originalUrl} ${statusCode} [${duration}ms] - Error: ${err?.message || 'Internal error'}`,
          );
        },
      }),
    );
  }

  private sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        lowerKey.includes(field),
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
