import { ApiProperty } from '@nestjs/swagger';
import { GuestDto } from './guest.dto';
import { TrackDto } from './track.dto';

export class RevisionInfoDto {
  @ApiProperty({ description: '리비전 ID' })
  id: number;

  @ApiProperty({ description: '리비전 번호' })
  revNo: number;

  @ApiProperty({ description: '리비전 설명', required: false })
  description?: string;

  @ApiProperty({ description: '리비전 상태' })
  status: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}

export class ProjectInfoResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

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

  @ApiProperty({ description: '리비전 목록', type: [RevisionInfoDto] })
  revisions: RevisionInfoDto[];

  @ApiProperty({ description: '트랙 목록', type: [TrackDto] })
  tracks: TrackDto[];

  @ApiProperty({ description: '초대된 게스트 목록', type: [GuestDto] })
  guests: GuestDto[];
}
