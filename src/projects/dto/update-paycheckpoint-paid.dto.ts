import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdatePayCheckPointPaidDto {
  @ApiProperty({
    description: '지급 체크포인트 ID',
    example: 1
  })
  @IsInt({ message: '지급 체크포인트 ID는 정수여야 합니다.' })
  paycheckpointId: number;

  @ApiProperty({
    description: '실제 지급액수 (0 이상)',
    example: 500000,
    minimum: 0
  })
  @IsInt({ message: '지급액수는 정수여야 합니다.' })
  @Min(0, { message: '지급액수는 0 이상이어야 합니다.' })
  paidAmount: number;
}
