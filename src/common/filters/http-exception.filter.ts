import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = new ApiResponseDto(
      null,
      exception.message || 'Internal Server Error',
      false,
    );

    errorResponse.errorCode = exception.name;

    console.error(
      `${request.method} ${request.url}`,
      `Status: ${status}`,
      `Message: ${exception.message}`,
      `Timestamp: ${new Date().toISOString()}`,
    );

    response.status(status).json(errorResponse);
  }
}
