import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateArcBeatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  index: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sceneId?: string;
}
