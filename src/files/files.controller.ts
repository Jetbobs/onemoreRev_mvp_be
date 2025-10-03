import { Controller, Get, NotFoundException, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Files')
@Controller('api/files')
export class FilesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':filename')
  @ApiOperation({
    summary: '파일 다운로드',
    description: '저장된 파일을 다운로드합니다. 로그인한 사용자만 사용할 수 있으며, 프로젝트 소유자만 소스 파일을 다운로드할 수 있습니다.'
  })
  @ApiParam({
    name: 'filename',
    description: '다운로드할 파일명',
    example: 'abc123.jpg'
  })
  @ApiResponse({
    status: 200,
    description: '파일 다운로드 성공'
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다.'
  })
  @ApiResponse({
    status: 403,
    description: '해당 파일에 대한 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '파일을 찾을 수 없습니다.'
  })
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    // 파일 정보 조회
    const file = await this.prisma.file.findFirst({
      where: { storedFilename: filename },
      include: {
        revision: {
          include: {
            project: {
              select: {
                id: true,
                authorId: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    // 소스 파일인 경우 프로젝트 소유자만 다운로드 가능
    if (file.src && file.revision.project.authorId !== req.session.userId) {
      throw new UnauthorizedException('소스 파일은 프로젝트 소유자만 다운로드할 수 있습니다.');
    }

    // 파일 경로 확인
    const filePath = path.join(process.cwd(), 'files', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('파일이 서버에 존재하지 않습니다.');
    }

    // 파일 스트림으로 응답
    const fileStream = fs.createReadStream(filePath);
    
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename}"`);
    res.setHeader('Content-Length', file.fileSize.toString());
    
    fileStream.pipe(res);
  }
}
