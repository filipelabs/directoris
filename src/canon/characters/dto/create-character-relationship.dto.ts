import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCharacterRelationshipDto {
  @ApiProperty({ description: 'ID of the target character' })
  @IsNotEmpty()
  @IsString()
  toId: string;

  @ApiProperty({ description: 'Relationship label (e.g., "mentor", "rival", "sibling")' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  label: string;

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
