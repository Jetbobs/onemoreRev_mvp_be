import { ApiProperty } from '@nestjs/swagger';

export class DeleteFeedbackReplyResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '피드백 ID' })
  feedbackId: number;

  @ApiProperty({ description: '작성자 이름' })
  authorName: string;

  @ApiProperty({ description: '프로젝트 이름' })
  projectName: string;

  @ApiProperty({ description: '리비전 번호' })
  revisionNo: number;

  @ApiProperty({ description: '트랙 이름' })
  trackName: string;

  @ApiProperty({ description: '피드백 내용' })
  content: string;

  @ApiProperty({ description: '삭제된 답글 내용' })
  deletedReply: string;

  @ApiProperty({ description: '해결 여부' })
  solved: boolean;

  @ApiProperty({ description: '답글 삭제 일시' })
  deletedAt: Date;
}
