import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PostDto> {
    try {
      const post = await this.prisma.post.create({
        data: createPostDto,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return post;
    } catch (error) {
      if (error.code === 'P2003') {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      throw error;
    }
  }

  async findAll(): Promise<PostDto[]> {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
    }

    return post;
  }

  async findByAuthor(authorId: number): Promise<PostDto[]> {
    return this.prisma.post.findMany({
      where: { authorId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostDto> {
    try {
      const post = await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      return post;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('존재하지 않는 사용자입니다.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`ID ${id}에 해당하는 게시글을 찾을 수 없습니다.`);
      }
      throw error;
    }
  }
}
