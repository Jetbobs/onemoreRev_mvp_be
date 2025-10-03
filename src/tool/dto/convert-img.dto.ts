import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ConvertImgDto {
  @ApiProperty({
    description: 'PSD 또는 AI 파일의 base64 인코딩된 내용',
    example: 'data:image/psd;base64,iVBORw0KGgoAAAANSUhEUgAA...'
  })
  @IsString({ message: '파일 내용은 base64 문자열이어야 합니다.' })
  fileContent: string;

  @ApiProperty({
    description: '출력 형식',
    example: 'png',
    enum: ['jpg', 'png']
  })
  @IsIn(['jpg', 'png'], { message: '출력 형식은 jpg 또는 png여야 합니다.' })
  outputFormat: string;

  @ApiProperty({
    description: '임시 파일 유지 여부 (1: 유지, 기타: 삭제)',
    example: 0,
    required: false
  })
  @IsOptional()
  @IsString({ message: '임시 파일 유지 옵션은 문자열이어야 합니다.' })
  keepTempFiles?: string;
}
