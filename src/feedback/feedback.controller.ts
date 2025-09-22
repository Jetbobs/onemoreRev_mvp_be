import { Body, Controller, Delete, Get, Post, Put, Query, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
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
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@Controller('api/v1/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: '피드백 등록',
    description: '게스트(프로젝트 의뢰인)가 디자인에 대한 피드백을 등록합니다. 초대 코드를 통해 권한을 확인합니다.'
  })
  @ApiBody({
    type: CreateFeedbackDto,
    description: '피드백 등록 정보'
  })
  @ApiResponse({
    status: 201,
    description: '피드백이 성공적으로 등록되었습니다.',
    type: FeedbackResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터 또는 유효하지 않은 초대 코드입니다.'
  })
  @ApiResponse({
    status: 403,
    description: '해당 프로젝트에 대한 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '프로젝트, 리비전 또는 트랙을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto
  ): Promise<FeedbackResponseDto> {
    return this.feedbackService.createFeedback(createFeedbackDto);
  }

  @Put()
  @ApiOperation({
    summary: '피드백 수정',
    description: '게스트(프로젝트 의뢰인)가 자신이 작성한 피드백의 내용을 수정합니다. 초대 코드를 통해 권한을 확인합니다.'
  })
  @ApiBody({
    type: EditFeedbackDto,
    description: '피드백 수정 정보'
  })
  @ApiResponse({
    status: 200,
    description: '피드백이 성공적으로 수정되었습니다.',
    type: EditFeedbackResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터 또는 유효하지 않은 초대 코드입니다.'
  })
  @ApiResponse({
    status: 404,
    description: '해당 피드백을 찾을 수 없거나 수정 권한이 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async editFeedback(
    @Body() editFeedbackDto: EditFeedbackDto
  ): Promise<EditFeedbackResponseDto> {
    return this.feedbackService.editFeedback(editFeedbackDto);
  }

  @Get()
  @ApiOperation({
    summary: '피드백 목록 조회 (리비전 단위)',
    description: '게스트(프로젝트 의뢰인) 또는 프로젝트 소유자가 특정 리비전의 피드백 목록을 조회합니다. 로그인된 경우 프로젝트 소유자 권한을 확인하고, 그렇지 않은 경우 초대 코드를 통해 게스트 권한을 확인합니다.'
  })
  @ApiQuery({
    name: 'code',
    description: '초대 코드 (게스트용, 로그인되지 않은 경우 필수)',
    example: 'AbCdEfGhIjKlMnOp',
    required: false
  })
  @ApiQuery({
    name: 'revisionId',
    description: '리비전 ID',
    example: 1,
    required: true
  })
  @ApiResponse({
    status: 200,
    description: '피드백 목록을 성공적으로 조회했습니다.',
    type: FeedbackListResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터, 유효하지 않은 초대 코드 또는 로그인/초대 코드가 필요합니다.'
  })
  @ApiResponse({
    status: 404,
    description: '해당 리비전을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getFeedbackList(
    @Query() getFeedbackListDto: GetFeedbackListDto,
    @Req() req: Request
  ): Promise<FeedbackListResponseDto> {
    const userId = req.session?.userId;
    return this.feedbackService.getFeedbackList(getFeedbackListDto, userId);
  }

  @Delete()
  @ApiOperation({
    summary: '피드백 삭제',
    description: '게스트(프로젝트 의뢰인)가 자신이 작성한 피드백을 삭제합니다. 초대 코드를 통해 권한을 확인합니다.'
  })
  @ApiBody({
    type: DeleteFeedbackDto,
    description: '피드백 삭제 정보'
  })
  @ApiResponse({
    status: 200,
    description: '피드백이 성공적으로 삭제되었습니다.',
    type: DeleteFeedbackResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터, 유효하지 않은 초대 코드 또는 submitted가 아닌 리비전입니다.'
  })
  @ApiResponse({
    status: 404,
    description: '해당 피드백을 찾을 수 없거나 삭제 권한이 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async deleteFeedback(
    @Body() deleteFeedbackDto: DeleteFeedbackDto
  ): Promise<DeleteFeedbackResponseDto> {
    return this.feedbackService.deleteFeedback(deleteFeedbackDto);
  }

  @Post('reply')
  @ApiOperation({
    summary: '피드백 답글 설정',
    description: '프로젝트 소유자가 피드백에 답글을 설정합니다. 기존 답글이 있으면 덮어씁니다. 리비전 상태가 reviewed일 때만 가능합니다.'
  })
  @ApiBody({
    type: AddFeedbackReplyDto,
    description: '피드백 답글 작성 정보'
  })
  @ApiResponse({
    status: 201,
    description: '피드백 답글이 성공적으로 설정되었습니다.',
    type: AddFeedbackReplyResponseDto
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
    description: '해당 피드백에 답글을 작성할 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '피드백을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async addFeedbackReply(
    @Body() addFeedbackReplyDto: AddFeedbackReplyDto,
    @Req() req: Request
  ): Promise<AddFeedbackReplyResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return this.feedbackService.addFeedbackReply(addFeedbackReplyDto, req.session.userId);
  }

  @Delete('reply')
  @ApiOperation({
    summary: '피드백 답글 삭제',
    description: '프로젝트 소유자가 피드백의 답글을 삭제합니다. 리비전 상태가 reviewed일 때만 가능합니다.'
  })
  @ApiBody({
    type: DeleteFeedbackReplyDto,
    description: '피드백 답글 삭제 정보'
  })
  @ApiResponse({
    status: 200,
    description: '피드백 답글이 성공적으로 삭제되었습니다.',
    type: DeleteFeedbackReplyResponseDto
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
    description: '해당 피드백의 답글을 삭제할 권한이 없습니다.'
  })
  @ApiResponse({
    status: 404,
    description: '피드백을 찾을 수 없습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async deleteFeedbackReply(
    @Body() deleteFeedbackReplyDto: DeleteFeedbackReplyDto,
    @Req() req: Request
  ): Promise<DeleteFeedbackReplyResponseDto> {
    // 세션에서 사용자 ID 확인
    if (!req.session.userId) {
      throw new Error('로그인이 필요합니다.');
    }

    return this.feedbackService.deleteFeedbackReply(deleteFeedbackReplyDto, req.session.userId);
  }
}
