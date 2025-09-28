import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { GuestDto } from './guest.dto';
import { PayCheckPointDto } from './pay-check-point.dto';

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

  @ApiProperty({
    description: '지급 체크포인트 목록',
    type: [PayCheckPointDto],
    required: false
  })
  @IsOptional()
  @IsArray({ message: '지급 체크포인트 목록은 배열이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => PayCheckPointDto)
  payCheckPoints?: PayCheckPointDto[];

  @ApiProperty({
    description: '프로젝트 시작일',
    example: '2024-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: '프로젝트 시작일은 유효한 날짜 형식이어야 합니다.' })
  startDate?: string;

  @ApiProperty({
    description: '초안 마감일',
    example: '2024-02-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: '초안 마감일은 유효한 날짜 형식이어야 합니다.' })
  draftDeadline?: string;

  @ApiProperty({
    description: '프로젝트 마감일',
    example: '2024-03-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: '프로젝트 마감일은 유효한 날짜 형식이어야 합니다.' })
  deadline?: string;

  @ApiProperty({
    description: '전체 가격',
    example: 1000000,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '전체 가격은 숫자여야 합니다.' })
  totalPrice?: number;

  @ApiProperty({
    description: '원본파일(PSD, AI) 제공 여부',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: '원본파일 제공 여부는 불린 값이어야 합니다.' })
  originalFileProvided?: boolean;

  @ApiProperty({
    description: '수정 횟수 제한',
    example: 3,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '수정 횟수 제한은 숫자여야 합니다.' })
  modLimit?: number;

  @ApiProperty({
    description: '추가 수정 요금',
    example: 100000,
    required: false
  })
  @IsOptional()
  @IsNumber({}, { message: '추가 수정 요금은 숫자여야 합니다.' })
  additionalModFee?: number;

  @ApiProperty({
    description: '수정 기준',
    example: '로고 크기 및 색상 변경 가능',
    required: false
  })
  @IsOptional()
  @IsString({ message: '수정 기준은 문자열이어야 합니다.' })
  modCriteria?: string;
}
