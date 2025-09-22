import { ApiProperty } from '@nestjs/swagger';
import { FeedbackListItemDto } from './feedback-list-item.dto';

export class FeedbackListResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '피드백 목록을 성공적으로 조회했습니다.'
  })
  message: string;

  @ApiProperty({
    description: '프로젝트 이름',
    example: '근본 렌터카 BI'
  })
  projectName: string;

  @ApiProperty({
    description: '총 피드백 개수',
    example: 5
  })
  totalCount: number;

  @ApiProperty({
    description: '해결된 피드백 개수',
    example: 2
  })
  solvedCount: number;

  @ApiProperty({
    description: '미해결 피드백 개수',
    example: 3
  })
  unsolvedCount: number;

  @ApiProperty({
    description: '피드백 목록',
    type: [FeedbackListItemDto]
  })
  feedbacks: FeedbackListItemDto[];
}
