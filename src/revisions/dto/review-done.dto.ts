import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewDoneDto {
  @ApiProperty({
    description: '초대 코드 (16자리)',
    example: 'AbCdEfGhIjKlMnOp',
  })
  @IsString({ message: 'code는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'code는 필수입니다.' })
  code: string;

  @ApiProperty({
    description: '리비전 ID',
    example: 1,
  })
  @IsNotEmpty({ message: 'revisionId는 필수입니다.' })
  revisionId: number;
}
