import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { GetProjectInfoDto } from './dto/get-project-info.dto';
import { ProjectInfoResponseDto } from './dto/project-info-response.dto';
import { LastRevisionDto, ProjectListItemDto, ProjectListResponseDto } from './dto/project-list-response.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RevisionResponseDto } from './dto/revision-response.dto';
import { FileInfoDto, SubmitRevisionResponseDto } from './dto/submit-revision-response.dto';
import { SubmitRevisionDto } from './dto/submit-revision.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    userId: number,
  ): Promise<ProjectResponseDto> {
    // 트랜잭션으로 프로젝트, 첫 리비전, 첫 트랙을 함께 생성
    const result = await this.prisma.$transaction(async (tx) => {
      // 프로젝트 생성
      const project = await tx.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          authorId: userId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          authorId: true,
          createdAt: true,
        },
      });

      // 첫 리비전 생성 (rev_no는 1로 시작)
      const revision = await tx.revision.create({
        data: {
          projectId: project.id,
          revNo: 1,
        },
        select: {
          id: true,
          revNo: true,
        },
      });

      // 첫 트랙 생성 (기본 이름으로)
      const track = await tx.track.create({
        data: {
          name: "메인 이미지",
          projectId: project.id,
          createdRevNo: revision.revNo,
          createdRevId: revision.id,
        },
        select: {
          id: true,
          name: true,
          createdRevNo: true,
          createdRevId: true,
        },
      });

      // 게스트 생성 및 초대 처리 (게스트 목록이 있는 경우)
      const createdGuests = [];
      if (createProjectDto.guests && createProjectDto.guests.length > 0) {
        for (const guestData of createProjectDto.guests) {
          // 전화번호 정규식 처리: 숫자만 추출
          const cleanedPhone = guestData.phone.replace(/\D/g, '');
          
          // 전화번호 자리수 검증 (10-11자리)
          if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
            throw new BadRequestException(`게스트 "${guestData.name}"의 전화번호는 10-11자리여야 합니다. (현재: ${cleanedPhone.length}자리)`);
          }

          // 게스트 생성
          const guest = await tx.guest.create({
            data: {
              name: guestData.name,
              email: guestData.email,
              phone: cleanedPhone, // 정제된 전화번호 저장
              host: userId,
            },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          });

          // 초대 생성
          await tx.invitation.create({
            data: {
              projectId: project.id,
              guestId: guest.id,
            },
          });

          createdGuests.push(guest);
        }
      }

      return {
        project,
        revision,
        track,
        guests: createdGuests,
      };
    });

    return {
      success: true,
      message: '프로젝트가 성공적으로 생성되었습니다.',
      id: result.project.id,
      name: result.project.name,
      description: result.project.description,
      authorId: result.project.authorId,
      createdAt: result.project.createdAt,
      firstRevisionId: result.revision.id,
      firstRevisionNo: result.revision.revNo,
      firstTrackId: result.track.id,
      firstTrackName: result.track.name,
      guests: result.guests,
    };
  }

  /**
   * 프로젝트에 새 리비전을 생성합니다.
   * @param createRevisionDto 리비전 생성 요청 데이터
   * @param userId 사용자 ID (소유권 확인용)
   * @returns 생성된 리비전 정보
   */
  async createRevision(
    createRevisionDto: CreateRevisionDto,
    userId: number,
  ): Promise<RevisionResponseDto> {
    // 프로젝트 존재 여부 및 소유권 확인
    const project = await this.prisma.project.findUnique({
      where: { id: createRevisionDto.projectId },
      select: { id: true, authorId: true },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException('해당 프로젝트에 대한 권한이 없습니다.');
    }

    // 트랜잭션으로 리비전 생성
    const revision = await this.prisma.$transaction(async (tx) => {
      // 해당 프로젝트의 최대 rev_no 조회
      const maxRevision = await tx.revision.findFirst({
        where: { projectId: createRevisionDto.projectId },
        orderBy: { revNo: 'desc' },
        select: { revNo: true },
      });

      // 다음 rev_no 계산 (없으면 1, 있으면 +1)
      const nextRevNo = maxRevision ? maxRevision.revNo + 1 : 1;

      // 새 리비전 생성
      const newRevision = await tx.revision.create({
        data: {
          projectId: createRevisionDto.projectId,
          revNo: nextRevNo,
        },
        select: {
          id: true,
          projectId: true,
          revNo: true,
          createdAt: true,
        },
      });

      return newRevision;
    });

    return {
      success: true,
      message: '리비전이 성공적으로 생성되었습니다.',
      id: revision.id,
      projectId: revision.projectId,
      revNo: revision.revNo,
      createdAt: revision.createdAt,
    };
  }

  /**
   * 사용자의 프로젝트 목록을 조회합니다.
   * @param userId 사용자 ID
   * @returns 프로젝트 목록
   */
  async getMyProjects(userId: number): Promise<ProjectListResponseDto> {
    const projects = await this.prisma.project.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        name: true,
        description: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            revisions: true,
          },
        },
        revisions: {
          select: {
            id: true,
            revNo: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            revNo: 'desc', // 리비전 번호 내림차순 (최신 리비전이 먼저)
          },
          take: 1, // 가장 최신 리비전 1개만 가져오기
        },
        tracks: {
          select: {
            id: true,
            name: true,
            createdRevNo: true,
            createdRevId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc', // 트랙 생성 순서대로 정렬
          },
        },
        invitations: {
          select: {
            guest: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // 초대 순서대로 정렬
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // 최신순으로 정렬
      },
    });

    const projectList: ProjectListItemDto[] = projects.map((project) => {
      const lastRevision: LastRevisionDto | undefined = project.revisions.length > 0 
        ? {
            id: project.revisions[0].id,
            revNo: project.revisions[0].revNo,
            description: project.revisions[0].description,
            createdAt: project.revisions[0].createdAt,
          }
        : undefined;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        authorId: project.authorId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        revisionCount: project._count.revisions,
        lastRevision,
        tracks: project.tracks, // 프로젝트에 귀속된 모든 트랙들
        guests: project.invitations.map(invitation => invitation.guest), // 프로젝트에 초대된 모든 게스트들
      };
    });

    return {
      success: true,
      message: '프로젝트 목록을 성공적으로 조회했습니다.',
      projects: projectList,
      totalCount: projectList.length,
    };
  }

  /**
   * 리비전을 제출하고 파일들을 저장합니다.
   * @param submitRevisionDto 제출할 리비전 정보
   * @param userId 사용자 ID
   * @returns 제출 결과
   */
  async submitRevision(
    submitRevisionDto: SubmitRevisionDto,
    userId: number,
  ): Promise<SubmitRevisionResponseDto> {
    // 리비전 존재 여부 및 권한 확인
    const revision = await this.prisma.revision.findUnique({
      where: { id: submitRevisionDto.revisionId },
      include: {
        project: {
          select: {
            authorId: true,
            name: true,
          },
        },
      },
    });

    if (!revision) {
      throw new NotFoundException('리비전을 찾을 수 없습니다.');
    }

    if (revision.project.authorId !== userId) {
      throw new ForbiddenException('해당 리비전을 제출할 권한이 없습니다.');
    }

    if (revision.status === 'submitted') {
      throw new BadRequestException('이미 제출된 리비전입니다.');
    }

    // 트랙 존재 여부 및 소유자 확인
    const trackIds = submitRevisionDto.uploads.map(upload => upload.trackId);
    const tracks = await this.prisma.track.findMany({
      where: {
        id: { in: trackIds },
        projectId: revision.projectId, // 같은 프로젝트에 속하는 트랙만
      },
      include: {
        project: {
          select: {
            authorId: true, // 프로젝트 소유자 ID
          },
        },
      },
    });

    if (tracks.length !== trackIds.length) {
      throw new BadRequestException('유효하지 않은 트랙 ID가 포함되어 있습니다.');
    }

    // 각 트랙의 프로젝트 소유자가 요청한 사용자와 같은지 확인
    const unauthorizedTracks = tracks.filter(track => track.project.authorId !== userId);
    if (unauthorizedTracks.length > 0) {
      const unauthorizedTrackIds = unauthorizedTracks.map(track => track.id);
      throw new ForbiddenException(`트랙 ID ${unauthorizedTrackIds.join(', ')}에 대한 권한이 없습니다.`);
    }

    // files 디렉토리 생성 (존재하지 않는 경우)
    const filesDir = path.join(process.cwd(), 'files');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    // 트랜잭션으로 파일 저장 및 리비전 상태 업데이트
    const result = await this.prisma.$transaction(async (tx) => {
      const savedFiles: FileInfoDto[] = [];

      // 각 파일 저장
      for (const upload of submitRevisionDto.uploads) {
        const fileData = upload.file;
        
        // Base64 디코딩
        const fileBuffer = Buffer.from(fileData.data, 'base64');
        
        // 파일명 생성 (UUID + 원본 확장자)
        const fileExtension = path.extname(fileData.original_filename);
        const storedFilename = `${crypto.randomUUID()}${fileExtension}`;
        const filePath = path.join(filesDir, storedFilename);
        
        // 파일 저장
        fs.writeFileSync(filePath, fileBuffer);
        
        // MIME 타입 추정 (간단한 확장자 기반)
        const mimeType = this.getMimeType(fileExtension);
        
        // 데이터베이스에 파일 정보 저장
        const savedFile = await tx.file.create({
          data: {
            revisionId: submitRevisionDto.revisionId,
            trackId: upload.trackId,
            originalFilename: fileData.original_filename,
            storedFilename: storedFilename,
            filePath: filePath,
            fileSize: BigInt(fileData.size),
            mimeType: mimeType,
            modifiedDatetime: new Date(fileData.modified_datetime),
          },
          select: {
            id: true,
            trackId: true,
            originalFilename: true,
            storedFilename: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
        });

        savedFiles.push({
          id: savedFile.id,
          trackId: savedFile.trackId,
          originalFilename: savedFile.originalFilename,
          storedFilename: savedFile.storedFilename,
          fileSize: Number(savedFile.fileSize),
          mimeType: savedFile.mimeType,
          uploadedAt: savedFile.uploadedAt,
        });
      }

      // 리비전 상태 업데이트
      const updatedRevision = await tx.revision.update({
        where: { id: submitRevisionDto.revisionId },
        data: {
          status: 'submitted',
          description: submitRevisionDto.description || revision.description,
        },
      });

      return {
        revision: updatedRevision,
        files: savedFiles,
      };
    });

    return {
      success: true,
      message: '리비전이 성공적으로 제출되었습니다.',
      revisionId: result.revision.id,
      status: result.revision.status,
      files: result.files,
      submittedAt: result.revision.updatedAt,
    };
  }

  /**
   * 파일 확장자에 따른 MIME 타입을 반환합니다.
   * @param extension 파일 확장자
   * @returns MIME 타입
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.psd': 'image/vnd.adobe.photoshop',
      '.ai': 'application/postscript',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 단일 프로젝트의 상세 정보를 조회합니다.
   * @param getProjectInfoDto 프로젝트 조회 정보
   * @param userId 사용자 ID
   * @returns 프로젝트 상세 정보
   */
  async getProjectInfo(
    getProjectInfoDto: GetProjectInfoDto,
    userId: number,
  ): Promise<ProjectInfoResponseDto> {
    // 프로젝트 존재 여부 및 소유자 확인
    const project = await this.prisma.project.findUnique({
      where: { id: getProjectInfoDto.projectId },
      include: {
        revisions: {
          select: {
            id: true,
            revNo: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            revNo: 'asc', // 리비전 번호 오름차순 정렬
          },
        },
        tracks: {
          select: {
            id: true,
            name: true,
            createdRevNo: true,
            createdRevId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: 'asc', // 트랙 생성 순서대로 정렬
          },
        },
        invitations: {
          select: {
            guest: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // 초대 순서대로 정렬
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException('해당 프로젝트에 대한 권한이 없습니다.');
    }

    return {
      success: true,
      message: '프로젝트 정보를 성공적으로 조회했습니다.',
      id: project.id,
      name: project.name,
      description: project.description,
      authorId: project.authorId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      revisions: project.revisions,
      tracks: project.tracks,
      guests: project.invitations.map(invitation => invitation.guest),
    };
  }
}
