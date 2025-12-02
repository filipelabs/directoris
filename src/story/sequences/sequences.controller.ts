import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SequencesService } from './sequences.service';
import { CreateSequenceDto, UpdateSequenceDto, ReorderSequencesDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('sequences')
@ApiBearerAuth()
@Controller()
export class SequencesController {
  constructor(private sequencesService: SequencesService) {}

  @Post('acts/:actId/sequences')
  @ApiOperation({ summary: 'Create a sequence in an act' })
  create(
    @CurrentUser() user: User,
    @Param('actId') actId: string,
    @Body() dto: CreateSequenceDto,
  ) {
    return this.sequencesService.create(actId, user.id, dto);
  }

  @Get('acts/:actId/sequences')
  @ApiOperation({ summary: 'List all sequences in an act' })
  findAllByAct(@CurrentUser() user: User, @Param('actId') actId: string) {
    return this.sequencesService.findAllByAct(actId, user.id);
  }

  @Get('sequences/:id')
  @ApiOperation({ summary: 'Get sequence by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.sequencesService.findById(id, user.id);
  }

  @Patch('sequences/:id')
  @ApiOperation({ summary: 'Update sequence' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSequenceDto,
  ) {
    return this.sequencesService.update(id, user.id, dto);
  }

  @Delete('sequences/:id')
  @ApiOperation({ summary: 'Delete sequence' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.sequencesService.delete(id, user.id);
  }

  @Patch('acts/:actId/sequences/reorder')
  @ApiOperation({ summary: 'Reorder sequences in an act' })
  reorder(
    @CurrentUser() user: User,
    @Param('actId') actId: string,
    @Body() dto: ReorderSequencesDto,
  ) {
    return this.sequencesService.reorder(actId, user.id, dto.sequenceIds);
  }
}
