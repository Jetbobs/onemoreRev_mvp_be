import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    // Prisma 클라이언트가 최신 스키마와 동기화되어 있는지 확인
    try {
      await this.$connect();
      console.log('✅ Prisma connected to MySQL database');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error.message);
      console.log('💡 Run "npx prisma generate" to update Prisma client');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Prisma disconnected from MySQL database');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter(key => key[0] !== '_');
    
    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}
