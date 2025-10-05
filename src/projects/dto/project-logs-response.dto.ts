import { ApiProperty } from '@nestjs/swagger';

export class ProjectLogItemDto {
  @ApiProperty({ description: '로그 ID' })
  id: number;

  @ApiProperty({ description: '사용자 ID (null인 경우 게스트 활동)', required: false })
  userId?: number;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '로그 메시지' })
  msg: string;

  @ApiProperty({ description: '로그 파라미터 (JSON 문자열)' })
  params: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '사용자 정보', required: false })
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

export class ProjectLogsResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '프로젝트명' })
  projectName: string;

  @ApiProperty({ description: '조회된 로그 개수' })
  totalCount: number;

  @ApiProperty({ description: '프로젝트 활동 로그 목록', type: [ProjectLogItemDto] })
  logs: ProjectLogItemDto[];
}
