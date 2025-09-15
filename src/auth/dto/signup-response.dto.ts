import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
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

  @ApiProperty({ description: '회원가입 성공 메시지' })
  message: string;
}
