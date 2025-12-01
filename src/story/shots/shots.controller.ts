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
import { ShotsService } from './shots.service';
import { CreateShotDto, UpdateShotDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { User } from '../../generated/prisma';

@ApiTags('shots')
@ApiBearerAuth()
@Controller()
export class ShotsController {
  constructor(private shotsService: ShotsService) {}

  @Post('scenes/:sceneId/shots')
  @ApiOperation({ summary: 'Create a shot in a scene' })
  create(
    @CurrentUser() user: User,
    @Param('sceneId') sceneId: string,
    @Body() dto: CreateShotDto,
  ) {
    return this.shotsService.create(sceneId, user.id, dto);
  }

  @Get('scenes/:sceneId/shots')
  @ApiOperation({ summary: 'List all shots in a scene' })
  findAllByScene(
    @CurrentUser() user: User,
    @Param('sceneId') sceneId: string,
  ) {
    return this.shotsService.findAllByScene(sceneId, user.id);
  }

  @Get('shots/:id')
  @ApiOperation({ summary: 'Get shot by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shotsService.findById(id, user.id);
  }

  @Patch('shots/:id')
  @ApiOperation({ summary: 'Update shot' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateShotDto,
  ) {
    return this.shotsService.update(id, user.id, dto);
  }

  @Delete('shots/:id')
  @ApiOperation({ summary: 'Delete shot' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shotsService.delete(id, user.id);
  }
}
