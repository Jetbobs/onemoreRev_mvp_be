import {
    Body,
    Controller,
    Post,
    Req,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AddTrackResponseDto } from './dto/add-track-response.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Tracks')
@Controller('api/v1/track')
export class TracksController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('add')
  @ApiOperation({
    summary: '트랙 추가',
    description: '기존 프로젝트에 새로운 트랙을 추가합니다. 로그인한 사용자만 사용할 수 있으며, 프로젝트 소유자만 트랙을 추가할 수 있습니다.'
  })
  @ApiBody({
    type: AddTrackDto,
    description: '트랙 추가 정보'
  })
  @ApiResponse({
    status: 201,
    description: '트랙이 성공적으로 추가되었습니다.',
    type: AddTrackResponseDto
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
    status: 403,
    description: '해당 프로젝트에 트랙을 추가할 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async addTrack(
    @Body() addTrackDto: AddTrackDto,
    @Req() req: Request
  ): Promise<AddTrackResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.addTrack(addTrackDto, req.session.userId);
  }
}

