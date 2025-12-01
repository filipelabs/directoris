import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ShotType } from '../../../generated/prisma';

export class CreateShotDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  index: number;

  @ApiProperty({ enum: ShotType })
  @IsEnum(ShotType)
  type: ShotType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationSec?: number;
}
