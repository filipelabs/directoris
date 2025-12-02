import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderScenesDto {
  @ApiProperty({ description: 'Array of scene IDs in the new order' })
  @IsArray()
  @IsString({ each: true })
  sceneIds: string[];
}
