import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestWithCorrelationId } from '../middleware/correlation-id.middleware';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithCorrelationId>();

    const correlationId = request?.correlationId || 'N/A';
    const isProduction = process.env.NODE_ENV === 'production';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        message = (body.message as string | string[]) || exception.message;
        error = (body.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      if (!isProduction) {
        message = exception.message;
      }
      error = exception.name || 'Error';
    }

    // Never leak stack trace or internal database details in production 500s
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR && isProduction) {
      message = 'An internal server error occurred. Please contact system support.';
      error = 'Internal Server Error';
    }

    this.logger.error(
      `[${correlationId}] Exception on ${request?.method} ${request?.url} - Status: ${statusCode} - Error: ${error} - Message: ${JSON.stringify(
        message,
      )}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      success: false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request?.url || '',
      correlationId,
    });
  }
}
