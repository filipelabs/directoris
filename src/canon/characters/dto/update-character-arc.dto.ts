import { PartialType } from '@nestjs/swagger';
import { CreateCharacterArcDto } from './create-character-arc.dto';

export class UpdateCharacterArcDto extends PartialType(CreateCharacterArcDto) {}
