import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '휴대폰 번호', example: '010-1234-5678' })
  @IsString()
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)' })
  phone: string;

  @ApiProperty({ description: '비밀번호', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
