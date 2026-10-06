import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { mkdirSync } from 'fs';
import { join } from 'path';

import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
  ) {}

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  // Public
  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  // Public
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.findOne(id);
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(
      id,
      updatePropertyDto,
    );
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.remove(id);
  }

  // ADMIN uniquement
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const propertyId = String(req.params.id);

          const uploadPath = join(
            process.cwd(),
            'uploads',
            'properties',
            propertyId,
          );

          mkdirSync(uploadPath, { recursive: true });

          callback(null, uploadPath);
        },

        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  addMedia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { filename: string },
  ) {
    return this.propertyService.addMedia(id, file);
  }
}