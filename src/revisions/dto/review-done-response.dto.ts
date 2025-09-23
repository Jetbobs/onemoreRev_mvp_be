import { ApiProperty } from '@nestjs/swagger';

export class ReviewDoneResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '리비전 ID' })
  revisionId: number;

  @ApiProperty({ description: '리비전 번호' })
  revisionNo: number;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '프로젝트 이름' })
  projectName: string;

  @ApiProperty({ description: '리비전 상태' })
  status: string;

  @ApiProperty({ description: '리뷰 완료 일시' })
  reviewedAt: Date;
}

