import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AddFeedbackReplyDto {
  @ApiProperty({
    description: '피드백 ID',
    example: 1,
  })
  @IsNumber({}, { message: 'feedbackId는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'feedbackId는 필수입니다.' })
  feedbackId: number;

  @ApiProperty({
    description: '답글 내용',
    example: '피드백을 확인했습니다. 수정하겠습니다.',
  })
  @IsString({ message: 'reply는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'reply는 필수입니다.' })
  reply: string;
}
