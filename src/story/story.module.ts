import { Module } from '@nestjs/common';
import { ActsController } from './acts/acts.controller';
import { ActsService } from './acts/acts.service';
import { SequencesController } from './sequences/sequences.controller';
import { SequencesService } from './sequences/sequences.service';
import { ScenesController } from './scenes/scenes.controller';
import { ScenesService } from './scenes/scenes.service';
import { ShotsController } from './shots/shots.controller';
import { ShotsService } from './shots/shots.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [
    ActsController,
    SequencesController,
    ScenesController,
    ShotsController,
  ],
  providers: [ActsService, SequencesService, ScenesService, ShotsService],
  exports: [ActsService, SequencesService, ScenesService, ShotsService],
})
export class StoryModule {}
