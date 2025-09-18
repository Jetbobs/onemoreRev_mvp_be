import { ApiProperty } from '@nestjs/swagger';
import { GuestDto } from './guest.dto';
import { TrackDto } from './track.dto';

export class LastRevisionDto {
  @ApiProperty({ description: '리비전 ID' })
  id: number;

  @ApiProperty({ description: '리비전 번호' })
  revNo: number;

  @ApiProperty({ description: '리비전 설명', required: false })
  description?: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}

export class ProjectListItemDto {
  @ApiProperty({ description: '프로젝트 ID' })
  id: number;

  @ApiProperty({ description: '프로젝트 이름' })
  name: string;

  @ApiProperty({ description: '프로젝트 설명', required: false })
  description?: string;

  @ApiProperty({ description: '작성자 ID' })
  authorId: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '리비전 개수' })
  revisionCount: number;

  @ApiProperty({ description: '마지막 리비전 정보', type: LastRevisionDto, required: false })
  lastRevision?: LastRevisionDto;

  @ApiProperty({ description: '프로젝트에 귀속된 트랙 목록', type: [TrackDto] })
  tracks: TrackDto[];

  @ApiProperty({ description: '프로젝트에 초대된 게스트 목록', type: [GuestDto] })
  guests: GuestDto[];
}

export class ProjectListResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '프로젝트 목록', type: [ProjectListItemDto] })
  projects: ProjectListItemDto[];

  @ApiProperty({ description: '총 프로젝트 개수' })
  totalCount: number;
}
