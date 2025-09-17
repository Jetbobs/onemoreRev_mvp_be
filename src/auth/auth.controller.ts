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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { SignupResponseDto } from './dto/signup-response.dto';
import { SignupDto } from './dto/signup.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('Auth')
@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('signup')
  @ApiOperation({ 
    summary: '회원가입 (GET)',
    description: 'GET 요청으로 회원가입을 처리합니다. 쿼리 파라미터로 데이터를 전달하세요.'
  })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
    type: SignupResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.'
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일입니다.'
  })
  async signupGet(@Query() query: any): Promise<SignupResponseDto> {
    const signupDto: SignupDto = {
      email: query.email,
      name: query.name,
      phone: query.phone,
      password: query.password,
      confirmPassword: query.confirmPassword,
    };
    
    return this.authService.signup(signupDto);
  }

  @Post('signup')
  @ApiOperation({ 
    summary: '회원가입',
    description: '새로운 사용자를 등록합니다.'
  })
  @ApiBody({ 
    type: SignupDto,
    description: '회원가입 정보'
  })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
    type: SignupResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.'
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 이메일입니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponseDto> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '사용자 로그인을 처리합니다. 로그인 성공 시 세션에 사용자 ID가 저장됩니다.'
  })
  @ApiBody({
    type: LoginDto,
    description: '로그인 정보'
  })
  @ApiResponse({
    status: 200,
    description: '로그인이 성공적으로 완료되었습니다.',
    type: LoginResponseDto
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터입니다.'
  })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 올바르지 않습니다.'
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginDto);
    req.session.userId = result.id;
    return result;
  }

  @Get('user/profile')
  @ApiOperation({
    summary: '사용자 프로필 조회',
    description: '로그인한 사용자의 프로필 정보를 조회합니다. 세션의 사용자 ID를 사용합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '사용자 프로필을 성공적으로 조회했습니다.',
    type: UserProfileDto
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요합니다.'
  })
  async getUserProfile(@Req() req: Request): Promise<UserProfileDto> {
    if (!req.session.userId) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
    return this.authService.getUserProfile(req.session.userId);
  }

  @Get('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자 로그아웃을 처리합니다. 세션을 삭제하여 로그인 상태를 해제합니다.'
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃이 성공적으로 완료되었습니다.',
    type: LogoutResponseDto
  })
  async logout(@Req() req: Request): Promise<LogoutResponseDto> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            success: true,
            message: '로그아웃이 성공적으로 완료되었습니다.',
          });
        }
      });
    });
  }
}
