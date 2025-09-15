import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupResponseDto } from './dto/signup-response.dto';
import { SignupDto } from './dto/signup.dto';

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
}
