import { ApiProperty } from '@nestjs/swagger';

export class PayCheckPointResponseDto {
  @ApiProperty({ description: '지급 체크포인트 ID' })
  id: number;

  @ApiProperty({ description: '지급일' })
  payDate: Date;

  @ApiProperty({ description: '금액' })
  price: number;

  @ApiProperty({ description: '라벨' })
  label: string;

  @ApiProperty({ description: '실제 지급액수' })
  paidAmount: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}
