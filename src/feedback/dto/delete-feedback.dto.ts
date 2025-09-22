import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeleteFeedbackDto {
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
    description: '삭제할 피드백 ID',
    example: 1
  })
  @IsNumber({}, { message: '피드백 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '피드백 ID는 필수입니다.' })
  feedbackId: number;
}
