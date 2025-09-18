import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateRevisionDto {
  @ApiProperty({
    description: '프로젝트 ID',
    example: 1,
    minimum: 1
  })
  @IsInt({ message: '프로젝트 ID는 정수여야 합니다.' })
  @Min(1, { message: '프로젝트 ID는 1 이상이어야 합니다.' })
  projectId: number;
}

