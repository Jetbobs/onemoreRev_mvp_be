import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogService } from './services/activity-log.service';

@Module({
  imports: [PrismaModule],
  providers: [ActivityLogService],
  exports: [ActivityLogService], // 다른 모듈에서 사용할 수 있도록 export
})
export class CommonModule {}
