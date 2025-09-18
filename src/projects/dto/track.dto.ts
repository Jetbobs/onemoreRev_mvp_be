import { ApiProperty } from '@nestjs/swagger';

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
}
