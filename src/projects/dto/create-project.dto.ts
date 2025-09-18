import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { GuestDto } from './guest.dto';

export class CreateProjectDto {
  @ApiProperty({
    description: '프로젝트 이름',
    example: '근본 렌터카 BI',
    minLength: 1,
    maxLength: 100
  })
  @IsString({ message: '프로젝트 이름은 문자열이어야 합니다.' })
  @MinLength(1, { message: '프로젝트 이름은 최소 1자 이상이어야 합니다.' })
  @MaxLength(100, { message: '프로젝트 이름은 최대 100자까지 입력 가능합니다.' })
  name: string;

  @ApiProperty({
    description: '프로젝트 설명 (개요)',
    example: '렌터카 업체 BI.\n심플하고 산뜻하게 삼성 느낌으로',
    required: false
  })
  @IsOptional()
  @IsString({ message: '프로젝트 설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '초대할 게스트 목록',
    type: [GuestDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: '게스트 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  guests?: GuestDto[];
}
