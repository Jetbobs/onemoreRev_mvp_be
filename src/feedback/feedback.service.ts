import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddFeedbackReplyResponseDto } from './dto/add-feedback-reply-response.dto';
import { AddFeedbackReplyDto } from './dto/add-feedback-reply.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { DeleteFeedbackReplyResponseDto } from './dto/delete-feedback-reply-response.dto';
import { DeleteFeedbackReplyDto } from './dto/delete-feedback-reply.dto';
import { DeleteFeedbackResponseDto } from './dto/delete-feedback-response.dto';
import { DeleteFeedbackDto } from './dto/delete-feedback.dto';
import { EditFeedbackResponseDto } from './dto/edit-feedback-response.dto';
import { EditFeedbackDto } from './dto/edit-feedback.dto';
import { FeedbackListResponseDto } from './dto/feedback-list-response.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { GetFeedbackListDto } from './dto/get-feedback-list.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  /**
   * 피드백 생성
   * @param createFeedbackDto 피드백 생성 데이터
   * @returns 생성된 피드백 정보
   */
  async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<FeedbackResponseDto> {
    // 초대 코드로 게스트와 프로젝트 정보 조회
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        code: createFeedbackDto.code,
      },
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

    // 초대 코드가 유효하지 않은 경우
    if (!invitation) {
      throw new BadRequestException('유효하지 않은 초대 코드입니다.');
    }

    // 프로젝트 ID가 일치하지 않는 경우
    if (invitation.projectId !== createFeedbackDto.projectId) {
      throw new ForbiddenException('해당 프로젝트에 대한 권한이 없습니다.');
    }

    // 리비전이 해당 프로젝트에 속하는지 확인
    const revision = await this.prisma.revision.findFirst({
      where: {
        id: createFeedbackDto.revisionId,
        projectId: createFeedbackDto.projectId,
      },
      select: {
        id: true,
        revNo: true,
        status: true,
      },
    });

    if (!revision) {
      throw new NotFoundException('해당 프로젝트의 리비전을 찾을 수 없습니다.');
    }

    // 리비전 상태가 'submitted'가 아닌 경우 피드백 등록 불가
    if (revision.status !== 'submitted') {
      throw new BadRequestException(`피드백을 등록할 수 없습니다. 리비전 상태가 'submitted'가 아닙니다. (현재 상태: ${revision.status})`);
    }

    // 트랙이 해당 프로젝트에 속하는지 확인
    const track = await this.prisma.track.findFirst({
      where: {
        id: createFeedbackDto.trackId,
        projectId: createFeedbackDto.projectId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!track) {
      throw new NotFoundException('해당 프로젝트의 트랙을 찾을 수 없습니다.');
    }

    // 피드백 생성
    const feedback = await this.prisma.feedback.create({
      data: {
        author: invitation.guest.id,
        projectId: createFeedbackDto.projectId,
        revisionId: createFeedbackDto.revisionId,
        trackId: createFeedbackDto.trackId,
        normalX: createFeedbackDto.normalX,
        normalY: createFeedbackDto.normalY,
        content: createFeedbackDto.content,
        solved: false,
      },
      select: {
        id: true,
        normalX: true,
        normalY: true,
        content: true,
        solved: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: '피드백이 성공적으로 등록되었습니다.',
      id: feedback.id,
      authorName: invitation.guest.name,
      projectName: invitation.project.name,
      revisionNo: revision.revNo,
      trackName: track.name,
      normalX: feedback.normalX,
      normalY: feedback.normalY,
      content: feedback.content,
      solved: feedback.solved,
      createdAt: feedback.createdAt,
    };
  }

  /**
   * 피드백 수정
   * @param editFeedbackDto 피드백 수정 데이터
   * @returns 수정된 피드백 정보
   */
  async editFeedback(editFeedbackDto: EditFeedbackDto): Promise<EditFeedbackResponseDto> {
    // 초대 코드로 게스트와 프로젝트 정보 조회
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        code: editFeedbackDto.code,
      },
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

    // 초대 코드가 유효하지 않은 경우
    if (!invitation) {
      throw new BadRequestException('유효하지 않은 초대 코드입니다.');
    }

    // 피드백이 존재하고 해당 게스트가 작성한 것인지 확인
    const existingFeedback = await this.prisma.feedback.findFirst({
      where: {
        id: editFeedbackDto.feedbackId,
        author: invitation.guest.id,
        projectId: invitation.projectId,
      },
      include: {
        revision: {
          select: {
            revNo: true,
            status: true,
          },
        },
        track: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingFeedback) {
      throw new NotFoundException('해당 피드백을 찾을 수 없거나 수정 권한이 없습니다.');
    }

    // 리비전 상태가 'submitted'가 아닌 경우 피드백 수정 불가
    if (existingFeedback.revision.status !== 'submitted') {
      throw new BadRequestException(`피드백을 수정할 수 없습니다. 리비전 상태가 'submitted'가 아닙니다. (현재 상태: ${existingFeedback.revision.status})`);
    }

    // 피드백 내용 수정
    const updatedFeedback = await this.prisma.feedback.update({
      where: {
        id: editFeedbackDto.feedbackId,
      },
      data: {
        content: editFeedbackDto.content,
      },
      select: {
        id: true,
        normalX: true,
        normalY: true,
        content: true,
        solved: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: '피드백이 성공적으로 수정되었습니다.',
      id: updatedFeedback.id,
      authorName: invitation.guest.name,
      projectName: invitation.project.name,
      revisionNo: existingFeedback.revision.revNo,
      trackName: existingFeedback.track.name,
      normalX: updatedFeedback.normalX,
      normalY: updatedFeedback.normalY,
      content: updatedFeedback.content,
      solved: updatedFeedback.solved,
      updatedAt: updatedFeedback.updatedAt,
    };
  }

  /**
   * 피드백 목록 조회 (리비전 단위) - 게스트 및 프로젝트 소유자 모두 사용 가능
   * @param getFeedbackListDto 피드백 목록 조회 조건
   * @param userId 로그인된 사용자 ID (선택사항)
   * @returns 피드백 목록 정보
   */
  async getFeedbackList(getFeedbackListDto: GetFeedbackListDto, userId?: number): Promise<FeedbackListResponseDto> {
    let projectId: number;
    let projectName: string;
    let authorName: string;

    // 리비전 정보 조회
    const revision = await this.prisma.revision.findFirst({
      where: {
        id: getFeedbackListDto.revisionId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            authorId: true,
          },
        },
      },
    });

    if (!revision) {
      throw new NotFoundException('해당 리비전을 찾을 수 없습니다.');
    }

    // 리비전 상태가 'submitted'가 아닌 경우 피드백 조회 불가
    if (revision.status !== 'submitted') {
      throw new BadRequestException(`피드백을 조회할 수 없습니다. 리비전 상태가 'submitted'가 아닙니다. (현재 상태: ${revision.status})`);
    }

    projectId = revision.project.id;
    projectName = revision.project.name;

    // 로그인된 사용자가 프로젝트 소유자인지 확인
    if (userId && revision.project.authorId === userId) {
      // 프로젝트 소유자인 경우
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      authorName = user?.name || '프로젝트 소유자';
    } else if (getFeedbackListDto.code) {
      // 초대 코드로 게스트 권한 확인
      const invitation = await this.prisma.invitation.findFirst({
        where: {
          code: getFeedbackListDto.code,
          projectId: projectId,
        },
        include: {
          guest: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new BadRequestException('유효하지 않은 초대 코드이거나 해당 프로젝트에 대한 권한이 없습니다.');
      }

      authorName = invitation.guest.name;
    } else {
      // 로그인되지 않았고 초대 코드도 없는 경우
      throw new BadRequestException('로그인이 필요하거나 유효한 초대 코드를 제공해주세요.');
    }

    // 해당 리비전의 피드백 목록 조회
    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        revisionId: getFeedbackListDto.revisionId,
        projectId: projectId,
      },
      include: {
        track: {
          select: {
            name: true,
          },
        },
        authorGuest: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 통계 계산
    const totalCount = feedbacks.length;
    const solvedCount = feedbacks.filter(feedback => feedback.solved).length;
    const unsolvedCount = totalCount - solvedCount;

    // 응답 데이터 구성
    const feedbackList = feedbacks.map(feedback => ({
      id: feedback.id,
      authorName: feedback.authorGuest.name,
      revisionNo: revision.revNo,
      trackName: feedback.track.name,
      normalX: feedback.normalX,
      normalY: feedback.normalY,
      content: feedback.content,
      solved: feedback.solved,
      createdAt: feedback.createdAt,
      updatedAt: feedback.updatedAt,
    }));

    return {
      success: true,
      message: '피드백 목록을 성공적으로 조회했습니다.',
      projectName: projectName,
      totalCount,
      solvedCount,
      unsolvedCount,
      feedbacks: feedbackList,
    };
  }

  /**
   * 피드백 삭제
   * @param deleteFeedbackDto 피드백 삭제 데이터
   * @returns 삭제된 피드백 정보
   */
  async deleteFeedback(deleteFeedbackDto: DeleteFeedbackDto): Promise<DeleteFeedbackResponseDto> {
    // 초대 코드로 게스트와 프로젝트 정보 조회
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        code: deleteFeedbackDto.code,
      },
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

    // 초대 코드가 유효하지 않은 경우
    if (!invitation) {
      throw new BadRequestException('유효하지 않은 초대 코드입니다.');
    }

    // 피드백이 존재하고 해당 게스트가 작성한 것인지 확인
    const existingFeedback = await this.prisma.feedback.findFirst({
      where: {
        id: deleteFeedbackDto.feedbackId,
        author: invitation.guest.id,
        projectId: invitation.projectId,
      },
      include: {
        revision: {
          select: {
            revNo: true,
            status: true,
          },
        },
        track: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingFeedback) {
      throw new NotFoundException('해당 피드백을 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    // 리비전 상태가 'submitted'가 아닌 경우 피드백 삭제 불가
    if (existingFeedback.revision.status !== 'submitted') {
      throw new BadRequestException(`피드백을 삭제할 수 없습니다. 리비전 상태가 'submitted'가 아닙니다. (현재 상태: ${existingFeedback.revision.status})`);
    }

    // 피드백 삭제
    await this.prisma.feedback.delete({
      where: {
        id: deleteFeedbackDto.feedbackId,
      },
    });

    return {
      success: true,
      message: '피드백이 성공적으로 삭제되었습니다.',
      deletedId: existingFeedback.id,
      authorName: invitation.guest.name,
      projectName: invitation.project.name,
      revisionNo: existingFeedback.revision.revNo,
      trackName: existingFeedback.track.name,
      content: existingFeedback.content,
    };
  }

  /**
   * 피드백에 답글 추가 (프로젝트 소유자용)
   * @param addFeedbackReplyDto 답글 추가 데이터
   * @param userId 사용자 ID (프로젝트 소유자)
   * @returns 답글 추가 결과
   */
  async addFeedbackReply(
    addFeedbackReplyDto: AddFeedbackReplyDto,
    userId: number,
  ): Promise<AddFeedbackReplyResponseDto> {
    // 피드백 존재 여부 및 프로젝트 소유자 확인
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: addFeedbackReplyDto.feedbackId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            authorId: true,
          },
        },
        revision: {
          select: {
            id: true,
            revNo: true,
            status: true,
          },
        },
        track: {
          select: {
            name: true,
          },
        },
        authorGuest: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('피드백을 찾을 수 없습니다.');
    }

    // 프로젝트 소유자 확인
    if (feedback.project.authorId !== userId) {
      throw new ForbiddenException('해당 피드백에 답글을 작성할 권한이 없습니다.');
    }

    // 리비전 상태가 'reviewed'가 아닌 경우 답글 작성 불가
    if (feedback.revision.status !== 'reviewed') {
      throw new BadRequestException(`피드백에 답글을 작성할 수 없습니다. 리비전 상태가 'reviewed'가 아닙니다. (현재 상태: ${feedback.revision.status})`);
    }

    // 피드백 답글 업데이트
    const updatedFeedback = await this.prisma.feedback.update({
      where: { id: addFeedbackReplyDto.feedbackId },
      data: {
        reply: addFeedbackReplyDto.reply,
      },
      select: {
        id: true,
        content: true,
        reply: true,
        solved: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: '피드백 답글이 성공적으로 설정되었습니다.',
      feedbackId: feedback.id,
      authorName: feedback.authorGuest.name,
      projectName: feedback.project.name,
      revisionNo: feedback.revision.revNo,
      trackName: feedback.track.name,
      content: feedback.content,
      reply: updatedFeedback.reply,
      solved: updatedFeedback.solved,
      repliedAt: updatedFeedback.updatedAt,
    };
  }

  /**
   * 피드백 답글 삭제 (프로젝트 소유자용)
   * @param deleteFeedbackReplyDto 답글 삭제 데이터
   * @param userId 사용자 ID (프로젝트 소유자)
   * @returns 답글 삭제 결과
   */
  async deleteFeedbackReply(
    deleteFeedbackReplyDto: DeleteFeedbackReplyDto,
    userId: number,
  ): Promise<DeleteFeedbackReplyResponseDto> {
    // 피드백 존재 여부 및 프로젝트 소유자 확인
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: deleteFeedbackReplyDto.feedbackId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            authorId: true,
          },
        },
        revision: {
          select: {
            id: true,
            revNo: true,
            status: true,
          },
        },
        track: {
          select: {
            name: true,
          },
        },
        authorGuest: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('피드백을 찾을 수 없습니다.');
    }

    // 프로젝트 소유자 확인
    if (feedback.project.authorId !== userId) {
      throw new ForbiddenException('해당 피드백의 답글을 삭제할 권한이 없습니다.');
    }

    // 리비전 상태가 'reviewed'가 아닌 경우 답글 삭제 불가
    if (feedback.revision.status !== 'reviewed') {
      throw new BadRequestException(`피드백 답글을 삭제할 수 없습니다. 리비전 상태가 'reviewed'가 아닙니다. (현재 상태: ${feedback.revision.status})`);
    }

    // 기존 답글 내용 저장
    const existingReply = feedback.reply;

    // 피드백 답글 삭제 (null로 설정)
    const updatedFeedback = await this.prisma.feedback.update({
      where: { id: deleteFeedbackReplyDto.feedbackId },
      data: {
        reply: null,
      },
      select: {
        id: true,
        content: true,
        reply: true,
        solved: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: '피드백 답글이 성공적으로 삭제되었습니다.',
      feedbackId: feedback.id,
      authorName: feedback.authorGuest.name,
      projectName: feedback.project.name,
      revisionNo: feedback.revision.revNo,
      trackName: feedback.track.name,
      content: feedback.content,
      deletedReply: existingReply,
      solved: updatedFeedback.solved,
      deletedAt: updatedFeedback.updatedAt,
    };
  }
}
