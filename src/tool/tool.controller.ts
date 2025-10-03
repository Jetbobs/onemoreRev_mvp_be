import { Body, Controller, Post, Req, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ConvertImgResponseDto } from './dto/convert-img-response.dto';
import { ConvertImgDto } from './dto/convert-img.dto';
import { ToolService } from './tool.service';

@ApiTags('Tool')
@Controller('api/tool')
export class ToolController {
  constructor(private readonly toolService: ToolService) {}

  @Post('convert_img')
  @ApiOperation({
    summary: 'PSD/AI 파일을 JPG/PNG로 변환',
    description: '로그인한 사용자만 이용 가능합니다. PSD 또는 AI 파일을 base64로 받아서 JPG 또는 PNG 형식으로 변환하여 반환합니다.'
  })
  @ApiBody({
    type: ConvertImgDto,
    description: '변환할 파일 정보'
  })
  @ApiResponse({
    status: 200,
    description: '이미지 변환이 성공적으로 완료되었습니다.',
    type: ConvertImgResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.'
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다.'
  })
  @ApiResponse({
    status: 500,
    description: '이미지 변환 중 오류가 발생했습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async convertImage(@Body() convertImgDto: ConvertImgDto, @Req() req: Request): Promise<ConvertImgResponseDto> {
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    return this.toolService.convertImage(convertImgDto);
  }
}
