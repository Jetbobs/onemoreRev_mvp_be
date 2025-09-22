import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetFeedbackListDto {
  @ApiProperty({
    description: '초대 코드',
    example: 'AbCdEfGhIjKlMnOp',
    minLength: 16,
    maxLength: 16
  })
  @IsString({ message: '초대 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '초대 코드는 필수입니다.' })
  code: string;

  @ApiProperty({
    description: '리비전 ID',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber({}, { message: '리비전 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '리비전 ID는 필수입니다.' })
  revisionId: number;
}
