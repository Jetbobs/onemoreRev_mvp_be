import { ApiProperty } from '@nestjs/swagger';

export class ProjectHistoryFileDto {
  @ApiProperty({ description: '파일 ID' })
  id: number;

  @ApiProperty({ description: '업로드된 트랙 ID' })
  trackId: number;

  @ApiProperty({ description: '원본 파일명' })
  originalFilename: string;

  @ApiProperty({ description: '저장된 파일명' })
  storedFilename: string;

  @ApiProperty({ description: '파일 크기(바이트)' })
  fileSize: number;

  @ApiProperty({ description: 'MIME 타입' })
  mimeType: string;

  @ApiProperty({ description: '업로드 일시' })
  uploadedAt: Date;
}

export class ProjectHistoryTrackDto {
  @ApiProperty({ description: '트랙 ID' })
  id: number;

  @ApiProperty({ description: '트랙 이름' })
  name: string;
}

export class ProjectHistoryRevisionDto {
  @ApiProperty({ description: '리비전 ID' })
  id: number;

  @ApiProperty({ description: '리비전 번호' })
  revNo: number;

  @ApiProperty({ description: '리비전 설명', required: false })
  description?: string;

  @ApiProperty({ description: '리비전 상태' })
  status: string;

  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;

  @ApiProperty({ description: '업데이트 일시' })
  updatedAt: Date;

  @ApiProperty({ type: [ProjectHistoryFileDto], description: '리비전에서 업로드된 파일 목록' })
  files: ProjectHistoryFileDto[];

  @ApiProperty({ type: [ProjectHistoryTrackDto], description: '해당 리비전에서 새로 생성된 트랙 목록' })
  createdTracks: ProjectHistoryTrackDto[];
}

export class ProjectHistoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '메시지' })
  message: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '프로젝트 이름' })
  projectName: string;

  @ApiProperty({ type: [ProjectHistoryRevisionDto], description: '프로젝트 리비전 히스토리' })
  revisions: ProjectHistoryRevisionDto[];
}
