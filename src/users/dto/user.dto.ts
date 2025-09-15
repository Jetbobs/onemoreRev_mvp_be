import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '사용자 ID' })
  id: number;

  @ApiProperty({ description: '사용자 이메일' })
  email: string;

  @ApiProperty({ description: '사용자 이름', required: false })
  name?: string;

  @ApiProperty({ description: '휴대폰 번호' })
  phone: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}
