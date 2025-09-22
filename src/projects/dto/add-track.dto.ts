import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class AddTrackDto {
  @ApiProperty({
    description: '트랙을 추가할 프로젝트 ID',
    example: 1
  })
  @IsInt({ message: '프로젝트 ID는 정수여야 합니다.' })
  projectId: number;

  @ApiProperty({
    description: '추가할 트랙 이름',
    example: '로고 디자인',
    minLength: 1,
    maxLength: 100
  })
  @IsString({ message: '트랙 이름은 문자열이어야 합니다.' })
  @MinLength(1, { message: '트랙 이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(100, { message: '트랙 이름은 최대 100자까지 입력 가능합니다.' })
  name: string;
}

