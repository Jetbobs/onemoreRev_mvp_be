import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class FileDataDto {
  @ApiProperty({
    description: '원본 파일명',
    example: 'design_final_v2.psd'
  })
  @IsString({ message: '원본 파일명은 문자열이어야 합니다.' })
  original_filename: string;

  @ApiProperty({
    description: '파일 크기 (바이트)',
    example: 2048576
  })
  @IsInt({ message: '파일 크기는 정수여야 합니다.' })
  size: number;

  @ApiProperty({
    description: '파일 최종 수정일시',
    example: '2024-01-15T10:30:00.000Z'
  })
  @Transform(({ value }) => {
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date;
  })
  @IsDate({ message: '수정일시는 유효한 날짜여야 합니다.' })
  modified_datetime: Date;

  @ApiProperty({
    description: '파일 바이너리 데이터 (Base64 인코딩)',
    example: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDQvMTEvMTD...'
  })
  @IsString({ message: '파일 데이터는 문자열(Base64)이어야 합니다.' })
  data: string;
}

export class UploadMetadataDto {
  @ApiProperty({
    description: '업로드할 트랙 ID',
    example: 1
  })
  @IsInt({ message: '트랙 ID는 정수여야 합니다.' })
  trackId: number;

  @ApiProperty({
    description: '업로드할 파일 정보',
    type: FileDataDto
  })
  @ValidateNested()
  @Type(() => FileDataDto)
  file: FileDataDto;
}

export class SubmitRevisionDto {
  @ApiProperty({
    description: '제출할 리비전 ID',
    example: 1
  })
  @IsInt({ message: '리비전 ID는 정수여야 합니다.' })
  revisionId: number;

  @ApiProperty({
    description: '제출자가 해당 리비전에 남길 코멘트',
    example: '최종 디자인 완료. 피드백 반영하여 수정했습니다.',
    required: false
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  description?: string;

  @ApiProperty({
    description: '업로드할 파일들의 메타데이터 배열',
    type: [UploadMetadataDto]
  })
  @IsArray({ message: '업로드 메타데이터는 배열이어야 합니다.' })
  @ValidateNested({ each: true })
  @Type(() => UploadMetadataDto)
  uploads: UploadMetadataDto[];
}
