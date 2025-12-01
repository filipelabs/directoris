import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// Note: toId is excluded from update - you cannot change the target of a relationship
export class UpdateCharacterRelationshipDto {
  @ApiPropertyOptional({ description: 'Relationship label (e.g., "mentor", "rival", "sibling")' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Dynamic of the relationship (e.g., "tense", "supportive")' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  dynamic?: string;
}
