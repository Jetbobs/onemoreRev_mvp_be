import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupResponseDto } from './dto/signup-response.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(signupDto: SignupDto): Promise<SignupResponseDto> {
    // phone 필드 필수 검증
    if (!signupDto.phone || signupDto.phone.trim() === '') {
      throw new BadRequestException('휴대폰 번호는 필수 입력 항목입니다.');
    }

    // 비밀번호 확인 검증
    if (signupDto.password !== signupDto.confirmPassword) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    try {
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      // 사용자 생성
      const user = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          name: signupDto.name,
          phone: signupDto.phone,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      });

      return {
        ...user,
        message: '회원가입이 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma에서 unique 제약조건 위반 시 어떤 필드인지 확인
        const meta = error.meta;
        if (meta && meta.target) {
          if (meta.target.includes('email')) {
            throw new ConflictException('이미 존재하는 이메일입니다.');
          } else if (meta.target.includes('phone')) {
            throw new ConflictException('이미 존재하는 휴대폰 번호입니다.');
          }
        }
        throw new ConflictException('이미 존재하는 정보입니다.');
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}
