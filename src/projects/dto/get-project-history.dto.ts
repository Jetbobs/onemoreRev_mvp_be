import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetProjectHistoryDto {
  @ApiProperty({
    description: '조회할 프로젝트 ID',
    example: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: 'projectId는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'projectId는 필수입니다.' })
  projectId: number;
}

