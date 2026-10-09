import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';

import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationQueryDto } from './dto/application-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) {}

  @Post('recruitments/:recruitmentId/applications')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const recruitmentId = String(
            req.params.recruitmentId,
          );

          const uploadPath = join(
            process.cwd(),
            'uploads',
            'applications',
            recruitmentId,
          );

          mkdirSync(uploadPath, {
            recursive: true,
          });

          callback(null, uploadPath);
        },

        filename: (req, file, callback) => {
          const extension = '.pdf';

          const uniqueName = `cv-${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extension}`;

          callback(null, uniqueName);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException(
              'Le CV doit être au format PDF',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  create(
    @Param('recruitmentId', ParseIntPipe)
    recruitmentId: number,

    @Body()
    createApplicationDto: CreateApplicationDto,

    @UploadedFile()
    file?: { filename: string },
  ) {
    const cvUrl = file
      ? `/uploads/applications/${recruitmentId}/${file.filename}`
      : undefined;

    return this.applicationService.create(
      recruitmentId,
      createApplicationDto,
      cvUrl,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('applications')
  findAll(
    @Query() query: ApplicationQueryDto,
  ) {
    return this.applicationService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('applications/:id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('applications/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.applicationService.remove(id);
  }
}