import { PartialType } from '@nestjs/swagger';
import { CreateCharacterFactDto } from './create-character-fact.dto';

export class UpdateCharacterFactDto extends PartialType(CreateCharacterFactDto) {}
