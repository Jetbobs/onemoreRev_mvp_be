import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetRevisionInfoDto {
  @ApiProperty({
    description: '조회할 리비전 ID',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '리비전 ID는 정수여야 합니다.' })
  revisionId: number;
}

