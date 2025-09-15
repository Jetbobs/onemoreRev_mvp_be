import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
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

  async findAll(): Promise<UserDto[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    try {
      const updateData: any = { ...updateUserDto };

      // 비밀번호가 있다면 해싱
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`);
      }
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

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id}에 해당하는 사용자를 찾을 수 없습니다.`);
      }
      throw error;
    }
  }
}
