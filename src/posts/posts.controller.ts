import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDto } from './dto/post.dto';
import { ApiCustomResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: '새 게시글 생성' })
  @ApiCustomResponse<PostDto>({ 
    status: 201, 
    description: '게시글이 성공적으로 생성되었습니다.',
    type: PostDto 
  })
  @ApiResponse({ status: 404, description: '존재하지 않는 사용자입니다.' })
  async create(@Body() createPostDto: CreatePostDto): Promise<PostDto> {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 게시글 조회' })
  @ApiQuery({ name: 'authorId', description: '작성자 ID', required: false, type: 'number' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록을 성공적으로 조회했습니다.',
    type: [PostDto]
  })
  async findAll(@Query('authorId') authorId?: string): Promise<PostDto[]> {
    if (authorId) {
      return this.postsService.findByAuthor(parseInt(authorId));
    }
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 게시글 조회' })
  @ApiParam({ name: 'id', description: '게시글 ID', type: 'number' })
  @ApiCustomResponse<PostDto>({ 
    description: '게시글을 성공적으로 조회했습니다.',
    type: PostDto 
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '게시글 수정' })
  @ApiParam({ name: 'id', description: '게시글 ID', type: 'number' })
  @ApiCustomResponse<PostDto>({ 
    description: '게시글이 성공적으로 수정되었습니다.',
    type: PostDto 
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiParam({ name: 'id', description: '게시글 ID', type: 'number' })
  @ApiResponse({ status: 200, description: '게시글이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.postsService.remove(id);
    return { message: '게시글이 성공적으로 삭제되었습니다.' };
  }
}
