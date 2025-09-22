import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EditFeedbackDto {
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
    description: '수정할 피드백 ID',
    example: 1
  })
  @IsNumber({}, { message: '피드백 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '피드백 ID는 필수입니다.' })
  feedbackId: number;

  @ApiProperty({
    description: '수정할 피드백 내용',
    example: '이 부분의 색상을 더 어둡게 해주세요.',
    minLength: 1,
    maxLength: 1000
  })
  @IsString({ message: '피드백 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '피드백 내용은 필수입니다.' })
  content: string;
}
