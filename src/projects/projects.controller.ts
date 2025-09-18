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
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { GetProjectInfoDto } from './dto/get-project-info.dto';
import { ProjectInfoResponseDto } from './dto/project-info-response.dto';
import { ProjectListResponseDto } from './dto/project-list-response.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RevisionResponseDto } from './dto/revision-response.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@Controller('api/v1/project')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('new')
  @ApiOperation({
    summary: '프로젝트 생성',
    description: '새로운 프로젝트를 생성합니다. 로그인한 사용자만 사용할 수 있으며, 생성 시 첫 리비전도 함께 생성됩니다.'
  })
  @ApiBody({
    type: CreateProjectDto,
    description: '프로젝트 생성 정보'
  })
  @ApiResponse({
    status: 201,
    description: '프로젝트가 성공적으로 생성되었습니다.',
    type: ProjectResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.'
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request
  ): Promise<ProjectResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.createProject(createProjectDto, req.session.userId);
  }

  @Post('revision/new')
  @ApiOperation({
    summary: '리비전 생성',
    description: '기존 프로젝트에 새로운 리비전을 생성합니다. 프로젝트 소유자만 사용할 수 있습니다.'
  })
  @ApiBody({
    type: CreateRevisionDto,
    description: '리비전 생성 정보'
  })
  @ApiResponse({
    status: 201,
    description: '리비전이 성공적으로 생성되었습니다.',
    type: RevisionResponseDto
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
    description: '해당 프로젝트에 대한 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createRevision(
    @Body() createRevisionDto: CreateRevisionDto,
    @Req() req: Request
  ): Promise<RevisionResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.createRevision(createRevisionDto, req.session.userId);
  }

  @Get('list')
  @ApiOperation({
    summary: '나의 프로젝트 목록 조회',
    description: '로그인한 사용자가 생성한 프로젝트 목록을 조회합니다. 최신순으로 정렬됩니다.'
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트 목록을 성공적으로 조회했습니다.',
    type: ProjectListResponseDto
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다.'
  })
  async getMyProjects(@Req() req: Request): Promise<ProjectListResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.getMyProjects(req.session.userId);
  }

  @Get('info')
  @ApiOperation({
    summary: '프로젝트 상세 정보 조회',
    description: '특정 프로젝트의 상세 정보를 조회합니다. 프로젝트 소유자만 조회할 수 있으며, 리비전과 트랙 정보도 함께 반환됩니다.'
  })
  @ApiQuery({
    name: 'projectId',
    description: '조회할 프로젝트 ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: '프로젝트 정보를 성공적으로 조회했습니다.',
    type: ProjectInfoResponseDto
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
    description: '해당 프로젝트에 대한 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트를 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getProjectInfo(
    @Query() getProjectInfoDto: GetProjectInfoDto,
    @Req() req: Request
  ): Promise<ProjectInfoResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    return this.projectsService.getProjectInfo(getProjectInfoDto, req.session.userId);
  }
}
