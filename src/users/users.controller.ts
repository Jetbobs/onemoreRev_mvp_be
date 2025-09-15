import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { ApiCustomResponse } from '../common/decorators/api-response.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '새 사용자 생성' })
  @ApiCustomResponse<UserDto>({ 
    status: 201, 
    description: '사용자가 성공적으로 생성되었습니다.',
    type: UserDto 
  })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일입니다.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록을 성공적으로 조회했습니다.',
    type: [UserDto]
  })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiParam({ name: 'id', description: '사용자 ID', type: 'number' })
  @ApiCustomResponse<UserDto>({ 
    description: '사용자를 성공적으로 조회했습니다.',
    type: UserDto 
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiParam({ name: 'id', description: '사용자 ID', type: 'number' })
  @ApiCustomResponse<UserDto>({ 
    description: '사용자 정보가 성공적으로 수정되었습니다.',
    type: UserDto 
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일입니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiParam({ name: 'id', description: '사용자 ID', type: 'number' })
  @ApiResponse({ status: 200, description: '사용자가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없습니다.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: '사용자가 성공적으로 삭제되었습니다.' };
  }
}
