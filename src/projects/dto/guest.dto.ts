import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class GuestDto {
  @ApiProperty({
    description: '게스트 이름',
    example: '홍길동'
  })
  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @MinLength(1, { message: '이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(50, { message: '이름은 최대 50자까지 입력 가능합니다.' })
  name: string;

  @ApiProperty({
    description: '게스트 이메일',
    example: 'guest@example.com'
  })
  @IsEmail({}, { message: '올바른 이메일 형식이어야 합니다.' })
  @MaxLength(100, { message: '이메일은 최대 100자까지 입력 가능합니다.' })
  email: string;

  @ApiProperty({
    description: '게스트 전화번호 (숫자만 추출하여 10-11자리 검증)',
    example: '010-1234-5678'
  })
  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  phone: string;
}
