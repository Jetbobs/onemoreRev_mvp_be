import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';
import { ApiResponseDto } from '../dto/response.dto';

export function ApiCustomResponse<T = any>(
  options: ApiResponseOptions & { type?: new () => T },
) {
  return applyDecorators(
    ApiResponse({
      status: options.status || 200,
      description: options.description || 'Success',
      type: ApiResponseDto,
      schema: {
        example: {
          success: true,
          message: 'Success',
          data: options.type ? new options.type() : null,
        },
      },
    }),
  );
}

export function ApiCustomPaginatedResponse<T = any>(
  type: new () => T,
  description: string = 'Paginated response',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      type: ApiResponseDto,
      schema: {
        example: {
          success: true,
          message: 'Success',
          data: [new type()],
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10,
          },
        },
      },
    }),
  );
}

export function ApiCustomArrayResponse<T = any>(
  type: new () => T,
  description: string = 'Array response',
) {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description,
      type: [type],
    }),
  );
}
