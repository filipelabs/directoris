import { Module } from '@nestjs/common';
import { CharactersController } from './characters/characters.controller';
import { CharactersService } from './characters/characters.service';
import { LocationsController } from './locations/locations.controller';
import { LocationsService } from './locations/locations.service';
import { RulesController } from './rules/rules.controller';
import { RulesService } from './rules/rules.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [CharactersController, LocationsController, RulesController],
  providers: [CharactersService, LocationsService, RulesService],
  exports: [CharactersService, LocationsService, RulesService],
})
export class CanonModule {}
