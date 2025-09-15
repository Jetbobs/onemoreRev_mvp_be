import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';

export class PostDto {
  @ApiProperty({ description: '게시글 ID' })
  id: number;

  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @ApiProperty({ description: '게시글 내용', required: false })
  content?: string;

  @ApiProperty({ description: '게시 여부' })
  published: boolean;

  @ApiProperty({ description: '작성자 ID' })
  authorId: number;

  @ApiProperty({ description: '작성자 정보', type: UserDto })
  author: UserDto;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}
