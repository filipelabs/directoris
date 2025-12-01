import { PartialType } from '@nestjs/swagger';
import { CreateArcBeatDto } from './create-arc-beat.dto';

export class UpdateArcBeatDto extends PartialType(CreateArcBeatDto) {}
