import { ApiProperty } from '@nestjs/swagger';

export class AddTrackResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '생성된 트랙 ID' })
  trackId: number;

  @ApiProperty({ description: '트랙 이름' })
  name: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '생성된 리비전 번호' })
  createdRevNo: number;

  @ApiProperty({ description: '생성된 리비전 ID' })
  createdRevId: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}

