import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { RecruitmentService } from './recruitment.service';

import { CreateRecruitmentDto } from './dto/create-recruitment.dto';
import { UpdateRecruitmentDto } from './dto/update-recruitment.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recruitments')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
  ) {}

  // Public
  @Get()
  findAll() {
    return this.recruitmentService.findAll();
  }

  // Public
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recruitmentService.findOne(id);
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(
    @Body() createRecruitmentDto: CreateRecruitmentDto,
  ) {
    return this.recruitmentService.create(
      createRecruitmentDto,
    );
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecruitmentDto: UpdateRecruitmentDto,
  ) {
    return this.recruitmentService.update(
      id,
      updateRecruitmentDto,
    );
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recruitmentService.remove(id);
  }
}