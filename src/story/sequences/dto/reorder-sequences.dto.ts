import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderSequencesDto {
  @ApiProperty({ description: 'Array of sequence IDs in the new order' })
  @IsArray()
  @IsString({ each: true })
  sequenceIds: string[];
}
