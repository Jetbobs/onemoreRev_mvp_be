import { ApiProperty } from '@nestjs/swagger';

export class AuthorDto {
  @ApiProperty({ description: '작성자 ID' })
  id: number;

  @ApiProperty({ description: '작성자 이메일' })
  email: string;

  @ApiProperty({ description: '작성자 이름' })
  name: string;

  @ApiProperty({ description: '작성자 전화번호' })
  phone: string;
}
