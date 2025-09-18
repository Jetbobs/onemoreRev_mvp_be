import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { GetRevisionInfoDto } from './dto/get-revision-info.dto';
import { RevisionInfoResponseDto } from './dto/revision-info-response.dto';
import { SubmitRevisionResponseDto } from './dto/submit-revision-response.dto';
import { SubmitRevisionDto } from './dto/submit-revision.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Revisions')
@Controller('api/v1/revision')
export class RevisionsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('submit')
  @ApiOperation({
    summary: '리비전 제출',
    description: '리비전에 파일들을 업로드하고 제출합니다. 로그인한 사용자만 사용할 수 있으며, 프로젝트 소유자만 제출할 수 있습니다.'
  })
  @ApiBody({
    type: SubmitRevisionDto,
    description: '리비전 제출 정보 및 업로드할 파일들'
  })
  @ApiResponse({
    status: 201,
    description: '리비전이 성공적으로 제출되었습니다.',
    type: SubmitRevisionResponseDto
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
    description: '해당 리비전을 제출할 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '리비전을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitRevision(
    @Body() submitRevisionDto: SubmitRevisionDto,
    @Req() req: Request
  ): Promise<SubmitRevisionResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.submitRevision(submitRevisionDto, req.session.userId);
  }

  @Get('info')
  @ApiOperation({
    summary: '리비전 상세 정보 조회',
    description: '특정 리비전의 상세 정보를 조회합니다. 프로젝트 소유자만 조회할 수 있으며, 각 트랙별로 해당 리비전 또는 그 이전 리비전의 최신 파일 정보를 반환합니다.'
  })
  @ApiQuery({
    name: 'revisionId',
    description: '조회할 리비전 ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: '리비전 정보를 성공적으로 조회했습니다.',
    type: RevisionInfoResponseDto
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
    description: '해당 리비전에 대한 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '리비전을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getRevisionInfo(
    @Query() getRevisionInfoDto: GetRevisionInfoDto,
    @Req() req: Request
  ): Promise<RevisionInfoResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.getRevisionInfo(getRevisionInfoDto, req.session.userId);
  }
}
