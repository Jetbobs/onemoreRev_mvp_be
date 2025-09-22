import { ApiProperty } from '@nestjs/swagger';
import { TrackFileDto } from './track.dto';

export class RevisionTrackDto {
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

  @ApiProperty({ description: '해당 리비전 또는 그 이전 리비전의 최신 파일 정보', type: TrackFileDto, required: false })
  latestFile?: TrackFileDto;
}

export class RevisionInfoResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '리비전 ID' })
  id: number;

  @ApiProperty({ description: '리비전 번호' })
  revNo: number;

  @ApiProperty({ description: '리비전 설명', required: false })
  description?: string;

  @ApiProperty({ description: '리비전 상태' })
  status: string;

  @ApiProperty({ description: '프로젝트 ID' })
  projectId: number;

  @ApiProperty({ description: '프로젝트 이름' })
  projectName: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '프로젝트의 모든 트랙 정보', type: [RevisionTrackDto] })
  tracks: RevisionTrackDto[];
}

