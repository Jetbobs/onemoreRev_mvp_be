import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetProjectInfoDto {
  @ApiProperty({
    description: '조회할 프로젝트 ID',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '프로젝트 ID는 정수여야 합니다.' })
  projectId: number;
}
