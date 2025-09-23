import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteFeedbackReplyDto {
  @ApiProperty({
    description: '피드백 ID',
    example: 1,
  })
  @IsNumber({}, { message: 'feedbackId는 숫자여야 합니다.' })
  @IsNotEmpty({ message: 'feedbackId는 필수입니다.' })
  feedbackId: number;
}

