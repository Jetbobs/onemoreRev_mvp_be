import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: '게시글 제목', example: '첫 번째 게시글' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '게시글 내용', example: '게시글 내용입니다.', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: '게시 여부', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ description: '작성자 ID', example: 1 })
  @IsInt()
  authorId: number;
}
