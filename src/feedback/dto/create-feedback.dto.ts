import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: '초대 코드',
    example: 'AbCdEfGhIjKlMnOp',
    minLength: 16,
    maxLength: 16
  })
  @IsString({ message: '초대 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '초대 코드는 필수입니다.' })
  code: string;

  @ApiProperty({
    description: '프로젝트 ID',
    example: 1
  })
  @IsNumber({}, { message: '프로젝트 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '프로젝트 ID는 필수입니다.' })
  projectId: number;

  @ApiProperty({
    description: '리비전 ID',
    example: 1
  })
  @IsNumber({}, { message: '리비전 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '리비전 ID는 필수입니다.' })
  revisionId: number;

  @ApiProperty({
    description: '트랙 ID',
    example: 1
  })
  @IsNumber({}, { message: '트랙 ID는 숫자여야 합니다.' })
  @IsNotEmpty({ message: '트랙 ID는 필수입니다.' })
  trackId: number;

  @ApiProperty({
    description: '정규화된 X 좌표 (0.0 ~ 1.0)',
    example: 0.5,
    minimum: 0.0,
    maximum: 1.0
  })
  @IsNumber({}, { message: 'X 좌표는 숫자여야 합니다.' })
  @Min(0.0, { message: 'X 좌표는 0.0 이상이어야 합니다.' })
  @Max(1.0, { message: 'X 좌표는 1.0 이하여야 합니다.' })
  @IsNotEmpty({ message: 'X 좌표는 필수입니다.' })
  normalX: number;

  @ApiProperty({
    description: '정규화된 Y 좌표 (0.0 ~ 1.0)',
    example: 0.3,
    minimum: 0.0,
    maximum: 1.0
  })
  @IsNumber({}, { message: 'Y 좌표는 숫자여야 합니다.' })
  @Min(0.0, { message: 'Y 좌표는 0.0 이상이어야 합니다.' })
  @Max(1.0, { message: 'Y 좌표는 1.0 이하여야 합니다.' })
  @IsNotEmpty({ message: 'Y 좌표는 필수입니다.' })
  normalY: number;

  @ApiProperty({
    description: '피드백 내용',
    example: '이 부분의 색상을 더 밝게 해주세요.',
    minLength: 1,
    maxLength: 1000
  })
  @IsString({ message: '피드백 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '피드백 내용은 필수입니다.' })
  content: string;
}
