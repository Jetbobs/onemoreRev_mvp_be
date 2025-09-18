import { ApiProperty } from '@nestjs/swagger';

export class FileInfoDto {
  @ApiProperty({ description: '파일 ID' })
  id: number;

  @ApiProperty({ description: '트랙 ID' })
  trackId: number;

  @ApiProperty({ description: '원본 파일명' })
  originalFilename: string;

  @ApiProperty({ description: '저장된 파일명' })
  storedFilename: string;

  @ApiProperty({ description: '파일 크기 (바이트)' })
  fileSize: number;

  @ApiProperty({ description: 'MIME 타입' })
  mimeType: string;

  @ApiProperty({ description: '업로드 일시' })
  uploadedAt: Date;
}

export class SubmitRevisionResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '리비전 ID' })
  revisionId: number;

  @ApiProperty({ description: '리비전 상태' })
  status: string;

  @ApiProperty({ description: '업로드된 파일 정보 목록', type: [FileInfoDto] })
  files: FileInfoDto[];

  @ApiProperty({ description: '제출 일시' })
  submittedAt: Date;
}
