import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RevisionsController } from './revisions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController, RevisionsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

