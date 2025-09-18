import { ApiProperty } from '@nestjs/swagger';
import { GuestDto } from './guest.dto';

export class ProjectResponseDto {
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

  @ApiProperty({ description: '첫 리비전 ID' })
  firstRevisionId: number;

  @ApiProperty({ description: '첫 리비전 번호' })
  firstRevisionNo: number;

  @ApiProperty({ description: '첫 트랙 ID' })
  firstTrackId: number;

  @ApiProperty({ description: '첫 트랙 이름' })
  firstTrackName: string;

  @ApiProperty({ description: '초대된 게스트 목록', type: [GuestDto] })
  guests: GuestDto[];
}
