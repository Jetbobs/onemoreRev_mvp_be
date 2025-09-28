import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class PayCheckPointDto {
  @ApiProperty({
    description: '지급일',
    example: '2024-01-15T00:00:00.000Z'
  })
  @IsDateString({}, { message: '지급일은 유효한 날짜 형식이어야 합니다.' })
  payDate: string;

  @ApiProperty({
    description: '금액',
    example: 500000,
    minimum: 0
  })
  @IsNumber({}, { message: '금액은 숫자여야 합니다.' })
  @Min(0, { message: '금액은 0 이상이어야 합니다.' })
  price: number;

  @ApiProperty({
    description: '라벨',
    example: '선금',
    maxLength: 50
  })
  @IsString({ message: '라벨은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '라벨은 최대 50자까지 입력 가능합니다.' })
  label: string;
}
