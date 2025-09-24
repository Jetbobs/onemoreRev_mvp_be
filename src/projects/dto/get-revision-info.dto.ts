import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GetRevisionInfoDto {
  @ApiProperty({
    description: '프로젝트 ID',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '프로젝트 ID는 정수여야 합니다.' })
  projectId: number;

  @ApiProperty({
    description: '리비전 번호',
    example: 1
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: '리비전 번호는 정수여야 합니다.' })
  revNo: number;

  @ApiProperty({
    description: '초대 코드 (게스트용, 로그인되지 않은 경우 필수)',
    example: 'AbCdEfGhIjKlMnOp',
    minLength: 16,
    maxLength: 16,
    required: false
  })
  @IsOptional()
  @IsString({ message: '초대 코드는 문자열이어야 합니다.' })
  code?: string;
}

