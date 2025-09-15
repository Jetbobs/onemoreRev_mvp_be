import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ 
    description: '사용자 이메일', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @ApiProperty({ 
    description: '사용자 이름', 
    example: '홍길동',
    required: false 
  })
  @IsOptional()
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  name?: string;

  @ApiProperty({ 
    description: '휴대폰 번호', 
    example: '010-1234-5678',
    required: true 
  })
  @IsString({ message: '휴대폰 번호는 문자열이어야 합니다.' })
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)' })
  phone: string;

  @ApiProperty({ 
    description: '비밀번호 (6자 이상)', 
    example: 'password123',
    minLength: 6
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({ 
    description: '비밀번호 확인', 
    example: 'password123'
  })
  @IsString({ message: '비밀번호 확인은 문자열이어야 합니다.' })
  confirmPassword: string;
}
