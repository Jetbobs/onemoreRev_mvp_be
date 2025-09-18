import { ApiProperty } from '@nestjs/swagger';

export class RevisionResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '리비전 ID' })
  id: number;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '리비전 번호' })
  revNo: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}

