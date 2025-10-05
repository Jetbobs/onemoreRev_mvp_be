import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 활동 로그를 생성합니다.
   * @param userId 사용자 ID (nullable)
   * @param projectId 프로젝트 ID (nullable)
   * @param msg 메시지
   * @param params 파라미터 객체 (JSON으로 변환되어 저장됨)
   * @returns 생성된 ActivityLog
   */
  async createLog(
    userId: number | null,
    projectId: number | null,
    msg: string,
    params?: Record<string, any>
  ) {
    try {
      const activityLog = await this.prisma.activityLog.create({
        data: {
          userId,
          projectId,
          msg,
          params: params ? JSON.stringify(params) : null,
        },
      });

      return activityLog;
    } catch (error) {
      // 로그 생성 실패는 시스템에 치명적이지 않으므로 에러를 던지지 않고 콘솔에만 출력
      console.error('ActivityLog 생성 실패:', error);
      return null;
    }
  }

  /**
   * 사용자별 활동 로그를 조회합니다.
   * @param userId 사용자 ID
   * @param limit 조회할 개수 (기본값: 50)
   * @returns ActivityLog 배열
   */
  async getUserLogs(userId: number, limit: number = 50) {
    return await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 프로젝트별 활동 로그를 조회합니다.
   * @param projectId 프로젝트 ID
   * @param limit 조회할 개수 (기본값: 50)
   * @returns ActivityLog 배열
   */
  async getProjectLogs(projectId: number, limit: number = 50) {
    return await this.prisma.activityLog.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * 전체 활동 로그를 조회합니다.
   * @param limit 조회할 개수 (기본값: 100)
   * @returns ActivityLog 배열
   */
  async getAllLogs(limit: number = 100) {
    return await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
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
  }
}
