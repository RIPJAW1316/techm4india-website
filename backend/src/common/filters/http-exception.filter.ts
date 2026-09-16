import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

type ErrorResponse = {
  message?: string | string[];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const errorResponse: ErrorResponse =
      typeof rawResponse === "object" && rawResponse !== null ? (rawResponse as ErrorResponse) : {};
    const message =
      typeof rawResponse === "string"
        ? rawResponse
        : (errorResponse.message ??
          (status === HttpStatus.INTERNAL_SERVER_ERROR
            ? "Internal server error"
            : "Request failed"));
    const details = Array.isArray(message) ? message : undefined;

    response.status(status).json({
      success: false,
      error: {
        code:
          status === HttpStatus.BAD_REQUEST
            ? "VALIDATION_ERROR"
            : (HttpStatus[status] ?? "HTTP_ERROR"),
        message: Array.isArray(message) ? message.join(", ") : message,
        ...(details ? { details } : {}),
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
