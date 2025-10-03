import { ApiProperty } from '@nestjs/swagger';

export class TrackFileDto {
  @ApiProperty({ description: '파일 ID' })
  id: number;

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

export class TrackDto {
  @ApiProperty({ description: '트랙 ID' })
  id: number;

  @ApiProperty({ description: '트랙 이름' })
  name: string;

  @ApiProperty({ description: '생성된 리비전 번호' })
  createdRevNo: number;

  @ApiProperty({ description: '생성된 리비전 ID' })
  createdRevId: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '최신 첨부파일 정보', type: TrackFileDto, required: false })
  latestFile?: TrackFileDto;

  @ApiProperty({ description: '최신 소스파일 정보 (PSD/AI 파일, 프로젝트 소유자만)', type: TrackFileDto, required: false })
  latestSrcFile?: TrackFileDto;
}
