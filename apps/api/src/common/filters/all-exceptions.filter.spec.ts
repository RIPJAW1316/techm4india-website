import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = { status: mockStatus };
    mockRequest = {
      url: '/api/v1/health',
      method: 'GET',
      correlationId: 'test-correlation-id-123',
    };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format HttpException into standard error response', () => {
    const exception = new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
        path: '/api/v1/health',
        correlationId: 'test-correlation-id-123',
      }),
    );
  });

  it('should format generic unhandled error into 500 response', () => {
    const exception = new Error('Unexpected database syntax error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        correlationId: 'test-correlation-id-123',
      }),
    );
  });
});
