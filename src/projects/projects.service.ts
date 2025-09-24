import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewDoneResponseDto } from '../revisions/dto/review-done-response.dto';
import { ReviewDoneDto } from '../revisions/dto/review-done.dto';
import { AddTrackResponseDto } from './dto/add-track-response.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateRevisionDto } from './dto/create-revision.dto';
import { GetProjectInfoDto } from './dto/get-project-info.dto';
import { GetRevisionInfoDto } from './dto/get-revision-info.dto';
import { ProjectInfoResponseDto } from './dto/project-info-response.dto';
import { LastRevisionDto, ProjectListItemDto, ProjectListResponseDto } from './dto/project-list-response.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { RevisionInfoResponseDto, RevisionTrackDto } from './dto/revision-info-response.dto';
import { RevisionResponseDto } from './dto/revision-response.dto';
import { FileInfoDto, SubmitRevisionResponseDto } from './dto/submit-revision-response.dto';
import { SubmitRevisionDto } from './dto/submit-revision.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * base64 형식의 16자리 랜덤 코드 생성
   * @returns 16자리 base64 인코딩된 랜덤 문자열
   */
  private generateInvitationCode(): string {
    // 12바이트 랜덤 데이터 생성 (base64로 인코딩하면 16자리가 됨)
    const randomBytes = crypto.randomBytes(12);
    return randomBytes.toString('base64');
  }

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

          // 초대 생성 (랜덤 코드 포함)
          await tx.invitation.create({
            data: {
              projectId: project.id,
              guestId: guest.id,
              code: this.generateInvitationCode(),
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
      // 해당 프로젝트의 최대 rev_no 조회 (상태도 함께 조회)
      const maxRevision = await tx.revision.findFirst({
        where: { projectId: createRevisionDto.projectId },
        orderBy: { revNo: 'desc' },
        select: { revNo: true, status: true },
      });

      // 기존 리비전이 있는 경우 상태 확인
      if (maxRevision && maxRevision.status !== 'reviewed') {
        throw new BadRequestException(`새 리비전을 생성할 수 없습니다. 이전 리비전(revNo: ${maxRevision.revNo})의 상태가 'reviewed'가 아닙니다. (현재 상태: ${maxRevision.status})`);
      }

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
            files: {
              select: {
                id: true,
                originalFilename: true,
                storedFilename: true,
                fileSize: true,
                mimeType: true,
                uploadedAt: true,
                revisionId: true,
                revision: {
                  select: {
                    revNo: true,
                  },
                },
              },
              orderBy: {
                revisionId: 'desc', // 최신 리비전의 파일이 먼저
              },
              take: 1, // 각 트랙당 최신 파일 1개만
            },
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
        tracks: project.tracks.map(track => ({
          id: track.id,
          name: track.name,
          createdRevNo: track.createdRevNo,
          createdRevId: track.createdRevId,
          createdAt: track.createdAt,
          updatedAt: track.updatedAt,
          latestFile: track.files.length > 0 ? {
            id: track.files[0].id,
            originalFilename: track.files[0].originalFilename,
            storedFilename: track.files[0].storedFilename,
            fileSize: Number(track.files[0].fileSize),
            mimeType: track.files[0].mimeType,
            uploadedAt: track.files[0].uploadedAt,
            revNo: track.files[0].revision.revNo,
          } : undefined,
        })), // 프로젝트에 귀속된 모든 트랙들 (최신 파일 정보 포함)
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
            files: {
              select: {
                id: true,
                originalFilename: true,
                storedFilename: true,
                fileSize: true,
                mimeType: true,
                uploadedAt: true,
                revisionId: true,
                revision: {
                  select: {
                    revNo: true,
                  },
                },
              },
              orderBy: {
                revisionId: 'desc', // 최신 리비전의 파일이 먼저
              },
              take: 1, // 각 트랙당 최신 파일 1개만
            },
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
      tracks: project.tracks.map(track => ({
        id: track.id,
        name: track.name,
        createdRevNo: track.createdRevNo,
        createdRevId: track.createdRevId,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
        latestFile: track.files.length > 0 ? {
          id: track.files[0].id,
          originalFilename: track.files[0].originalFilename,
          storedFilename: track.files[0].storedFilename,
          fileSize: Number(track.files[0].fileSize),
          mimeType: track.files[0].mimeType,
          uploadedAt: track.files[0].uploadedAt,
          revNo: track.files[0].revision.revNo,
        } : undefined,
      })),
      guests: project.invitations.map(invitation => invitation.guest),
    };
  }

  async addTrack(addTrackDto: AddTrackDto, userId: number): Promise<AddTrackResponseDto> {
    // 프로젝트 존재 여부 및 소유자 확인
    const project = await this.prisma.project.findUnique({
      where: { id: addTrackDto.projectId },
      select: {
        id: true,
        name: true,
        authorId: true,
        revisions: {
          select: {
            id: true,
            revNo: true,
          },
          orderBy: {
            revNo: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException('해당 프로젝트에 트랙을 추가할 권한이 없습니다.');
    }

    // 최신 리비전이 있는지 확인
    if (project.revisions.length === 0) {
      throw new BadRequestException('프로젝트에 리비전이 없습니다. 먼저 리비전을 생성해주세요.');
    }

    const latestRevision = project.revisions[0];

    // 트랙 생성
    const track = await this.prisma.track.create({
      data: {
        name: addTrackDto.name,
        projectId: addTrackDto.projectId,
        createdRevNo: latestRevision.revNo,
        createdRevId: latestRevision.id,
      },
      select: {
        id: true,
        name: true,
        projectId: true,
        createdRevNo: true,
        createdRevId: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: '트랙이 성공적으로 추가되었습니다.',
      trackId: track.id,
      name: track.name,
      projectId: track.projectId,
      createdRevNo: track.createdRevNo,
      createdRevId: track.createdRevId,
      createdAt: track.createdAt,
    };
  }

  async getRevisionInfo(getRevisionInfoDto: GetRevisionInfoDto, userId?: number): Promise<RevisionInfoResponseDto> {
    // 리비전 존재 여부 및 권한 확인
    const revision = await this.prisma.revision.findFirst({
      where: { 
        projectId: getRevisionInfoDto.projectId,
        revNo: getRevisionInfoDto.revNo
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            authorId: true,
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
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!revision) {
      throw new NotFoundException('리비전을 찾을 수 없습니다.');
    }

    // 권한 확인: 초대코드가 있으면 먼저 검사, 없으면 로그인 정보로 검사
    if (getRevisionInfoDto.code) {
      // 초대코드가 있는 경우: 초대코드 유효성 검사 먼저
      const invitation = await this.prisma.invitation.findFirst({
        where: { code: getRevisionInfoDto.code },
        include: {
          project: { select: { id: true } },
          guest: { select: { id: true, name: true } },
        },
      });

      if (!invitation) {
        throw new NotFoundException('유효하지 않은 초대 코드입니다.');
      }

      if (invitation.project.id !== revision.project.id) {
        throw new ForbiddenException('해당 리비전에 대한 권한이 없습니다.');
      }
    } else if (userId && revision.project.authorId === userId) {
      // 초대코드가 없고 로그인된 프로젝트 소유자인 경우
    } else {
      throw new UnauthorizedException('로그인이 필요하거나 유효한 초대 코드를 제공해주세요.');
    }


    // 각 트랙별로 요청한 리비전 또는 그 이전 리비전의 최신 파일 조회
    const tracksWithFiles: RevisionTrackDto[] = [];
    
    for (const track of revision.project.tracks) {
      // 해당 트랙에서 요청한 리비전 번호 이하의 최신 파일 조회
      const latestFile = await this.prisma.file.findFirst({
        where: {
          trackId: track.id,
          revision: {
            revNo: {
              lte: revision.revNo, // 요청한 리비전 번호 이하
            },
          },
        },
        select: {
          id: true,
          originalFilename: true,
          storedFilename: true,
          fileSize: true,
          mimeType: true,
          uploadedAt: true,
        },
        orderBy: [
          {
            revision: {
              revNo: 'desc', // 리비전 번호 내림차순
            },
          },
          {
            uploadedAt: 'desc', // 같은 리비전 내에서는 업로드 시간 내림차순
          },
        ],
      });

      tracksWithFiles.push({
        id: track.id,
        name: track.name,
        createdRevNo: track.createdRevNo,
        createdRevId: track.createdRevId,
        createdAt: track.createdAt,
        updatedAt: track.updatedAt,
        latestFile: latestFile ? {
          id: latestFile.id,
          originalFilename: latestFile.originalFilename,
          storedFilename: latestFile.storedFilename,
          fileSize: Number(latestFile.fileSize),
          mimeType: latestFile.mimeType,
          uploadedAt: latestFile.uploadedAt,
        } : undefined,
      });
    }

    // 해당 프로젝트의 마지막 리비전 여부 확인
    const maxRevNo = await this.prisma.revision.findFirst({
      where: { projectId: revision.project.id },
      select: { revNo: true },
      orderBy: { revNo: 'desc' }
    });
    const isLast = maxRevNo ? revision.revNo === maxRevNo.revNo : true;

    // 해당 프로젝트의 첫 번째 게스트 초대 코드 조회
    const firstInvitation = await this.prisma.invitation.findFirst({
      where: { projectId: revision.project.id },
      select: { code: true },
      orderBy: { id: 'asc' }
    });
    const invitationCode = firstInvitation?.code;

    // 해당 리비전의 피드백 목록 조회
    const feedbacks = await this.prisma.feedback.findMany({
      where: { revisionId: revision.id },
      include: {
        authorGuest: {
          select: { name: true }
        },
        track: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const feedbacksWithDetails = feedbacks.map(feedback => ({
      id: feedback.id,
      authorName: feedback.authorGuest.name,
      trackId: feedback.trackId,
      trackName: feedback.track.name,
      normalX: feedback.normalX,
      normalY: feedback.normalY,
      content: feedback.content,
      reply: feedback.reply || undefined,
      solved: feedback.solved,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));

    return {
      success: true,
      message: '리비전 정보를 성공적으로 조회했습니다.',
      id: revision.id,
      revNo: revision.revNo,
      description: revision.description,
      status: revision.status,
      projectId: revision.project.id,
      projectName: revision.project.name,
      createdAt: revision.createdAt,
      updatedAt: revision.updatedAt,
      isLast: isLast,
      invitationCode: invitationCode,
      tracks: tracksWithFiles,
      feedbacks: feedbacksWithDetails,
    };
  }

  async getProjectHistory(projectId: number, userId: number) {
    // 프로젝트 존재 여부 및 소유자 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        authorId: true,
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다.');
    }

    if (project.authorId !== userId) {
      throw new ForbiddenException('해당 프로젝트에 대한 권한이 없습니다.');
    }

    // 프로젝트의 모든 리비전과 해당 리비전의 파일, 그리고 해당 리비전에서 새로 생성된 트랙 조회
    const revisions = await this.prisma.revision.findMany({
      where: { projectId },
      orderBy: { revNo: 'asc' },
      select: {
        id: true,
        revNo: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        files: {
          select: {
            id: true,
            trackId: true,
            originalFilename: true,
            storedFilename: true,
            fileSize: true,
            mimeType: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'asc' },
        },
      },
    });

    const createdTracks = await this.prisma.track.findMany({
      where: { projectId },
      select: {
        id: true,
        name: true,
        createdRevId: true,
      },
    });

    const revisionsWithTracks = revisions.map((rev) => ({
      id: rev.id,
      revNo: rev.revNo,
      description: rev.description || undefined,
      status: rev.status,
      createdAt: rev.createdAt,
      updatedAt: rev.updatedAt,
      createdTracks: createdTracks
        .filter((t) => t.createdRevId === rev.id)
        .map((t) => ({ id: t.id, name: t.name })),
      files: rev.files.map((f) => ({
        id: f.id,
        trackId: f.trackId,
        originalFilename: f.originalFilename,
        storedFilename: f.storedFilename,
        fileSize: Number(f.fileSize),
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt,
      })),
    }));

    return {
      success: true,
      message: '프로젝트 히스토리를 성공적으로 조회했습니다.',
      projectId: project.id,
      projectName: project.name,
      revisions: revisionsWithTracks,
    };
  }

  /**
   * 리비전 리뷰 완료 (게스트용)
   * @param reviewDoneDto 리뷰 완료 데이터
   * @returns 리뷰 완료 결과
   */
  async reviewDone(reviewDoneDto: ReviewDoneDto): Promise<ReviewDoneResponseDto> {
    // 초대 코드로 게스트 및 프로젝트 확인
    const invitation = await this.prisma.invitation.findFirst({
      where: { code: reviewDoneDto.code },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('유효하지 않은 초대 코드입니다.');
    }

    // 리비전 존재 여부 및 프로젝트 매칭 확인
    const revision = await this.prisma.revision.findUnique({
      where: { id: reviewDoneDto.revisionId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!revision) {
      throw new NotFoundException('리비전을 찾을 수 없습니다.');
    }

    // 리비전이 해당 프로젝트에 속하는지 확인
    if (revision.projectId !== invitation.projectId) {
      throw new ForbiddenException('해당 리비전에 대한 권한이 없습니다.');
    }

    // 리비전 상태가 'submitted'가 아닌 경우 실패
    if (revision.status !== 'submitted') {
      throw new BadRequestException(`리뷰를 완료할 수 없습니다. 리비전 상태가 'submitted'가 아닙니다. (현재 상태: ${revision.status})`);
    }

    // 리비전 상태를 'reviewed'로 업데이트
    const updatedRevision = await this.prisma.revision.update({
      where: { id: reviewDoneDto.revisionId },
      data: {
        status: 'reviewed',
      },
      select: {
        id: true,
        revNo: true,
        status: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: '리비전 리뷰가 성공적으로 완료되었습니다.',
      revisionId: updatedRevision.id,
      revisionNo: updatedRevision.revNo,
      projectId: revision.project.id,
      projectName: revision.project.name,
      status: updatedRevision.status,
      reviewedAt: updatedRevision.updatedAt,
    };
  }
}
