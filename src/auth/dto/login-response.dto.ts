import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: '사용자 ID' })
  id: number;

  @ApiProperty({ description: '사용자 이메일' })
  email: string;

  @ApiProperty({ description: '사용자 이름', required: false })
  name?: string;

  @ApiProperty({ description: '휴대폰 번호', required: false })
  phone?: string;

  @ApiProperty({ description: '로그인 성공 메시지' })
  message: string;

  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;
}