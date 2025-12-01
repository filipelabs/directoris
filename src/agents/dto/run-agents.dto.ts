import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { AgentType } from '../../generated/prisma';

export class RunAgentsDto {
  @ApiPropertyOptional({
    enum: AgentType,
    isArray: true,
    description: 'Specific agent types to run. If empty, runs all.',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AgentType, { each: true })
  agentTypes?: AgentType[];
}
