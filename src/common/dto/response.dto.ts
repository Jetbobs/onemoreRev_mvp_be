import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '응답 데이터' })
  data?: T;

  @ApiProperty({ description: '에러 코드', required: false })
  errorCode?: string;

  constructor(data?: T, message: string = 'Success', success: boolean = true) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({ description: '페이지네이션 정보' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Success',
  ) {
    super(data, message);
    this.pagination = pagination;
  }
}
