import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RevisionsController } from './revisions.controller';
import { TracksController } from './tracks.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController, RevisionsController, TracksController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

