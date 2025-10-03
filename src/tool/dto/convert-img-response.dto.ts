import { ApiProperty } from '@nestjs/swagger';

export class ConvertImgResponseDto {
  @ApiProperty({ description: '응답 성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  @ApiProperty({ description: '변환된 파일의 base64 인코딩된 내용' })
  fileContent: string;

  @ApiProperty({ description: '파일 크기 (바이트)' })
  fileSize: number;

  @ApiProperty({ description: '파일 수정일시' })
  modifiedDate: Date;

  @ApiProperty({ description: '출력 형식' })
  outputFormat: string;
}
