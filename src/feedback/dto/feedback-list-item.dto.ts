import { ApiProperty } from '@nestjs/swagger';

export class FeedbackListItemDto {
  @ApiProperty({
    description: '피드백 ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: '작성자 이름',
    example: '김게스트'
  })
  authorName: string;

  @ApiProperty({
    description: '리비전 번호',
    example: 1
  })
  revisionNo: number;

  @ApiProperty({
    description: '트랙 이름',
    example: '메인 이미지'
  })
  trackName: string;

  @ApiProperty({
    description: '정규화된 X 좌표',
    example: 0.5
  })
  normalX: number;

  @ApiProperty({
    description: '정규화된 Y 좌표',
    example: 0.3
  })
  normalY: number;

  @ApiProperty({
    description: '피드백 내용',
    example: '이 부분의 색상을 더 밝게 해주세요.'
  })
  content: string;

  @ApiProperty({
    description: '해결 여부',
    example: false
  })
  solved: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: Date;
}
