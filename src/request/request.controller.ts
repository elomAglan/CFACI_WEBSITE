import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RequestService } from './request.service';

import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestQueryDto } from './dto/request-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('requests')
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
  ) {}

  // Public ou CLIENT connecté
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: any,
  ) {
    return this.requestService.create(
      createRequestDto,
      req.user?.userId,
    );
  }

  // CLIENT connecté : voir ses propres demandes
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyRequests(@Req() req: any) {
    return this.requestService.findMyRequests(
      req.user.userId,
    );
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query() query: RequestQueryDto) {
    return this.requestService.findAll(query);
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.requestService.findOne(id);
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestService.update(
      id,
      updateRequestDto,
    );
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.remove(id);
  }
}