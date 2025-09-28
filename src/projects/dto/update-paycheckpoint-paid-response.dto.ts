import { ApiProperty } from '@nestjs/swagger';

export class UpdatePayCheckPointPaidResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '지급 체크포인트 ID' })
  paycheckpointId: number;

  @ApiProperty({ description: '업데이트된 지급액수' })
  paidAmount: number;

  @ApiProperty({ description: '업데이트된 라벨' })
  label: string;

  @ApiProperty({ description: '업데이트된 금액' })
  price: number;
}
