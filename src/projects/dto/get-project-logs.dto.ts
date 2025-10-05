import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetProjectLogsDto {
  @ApiProperty({
    description: '프로젝트 ID',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '프로젝트 ID는 정수여야 합니다.' })
  projectId: number;

  @ApiProperty({
    description: '조회할 로그 개수 제한 (입력하지 않거나 음수인 경우 모든 로그 조회)',
    example: 100,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt({ message: '개수는 정수여야 합니다.' })
  limit?: number;
}
