import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
  correlationId?: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<RequestWithCorrelationId>();
    const statusCode = response.statusCode || 200;

    // Skip wrapping for Swagger documentation or non-JSON responses
    if (request?.url && (request.url.includes('/docs') || request.url.includes('/docs-json'))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
        correlationId: request?.correlationId,
      })),
    );
  }
}
