import { Get, Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from 'src/auth/dto/createCourse.dto';
import { CacheService } from '../cache/cache.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async findAll() {
    const cacheKey = 'courses-data';
    let data = await this.cacheService.get(cacheKey);
    if (!data) {
      const data = await this.coursesService.getAllCourses();
      await this.cacheService.set(cacheKey, data, "30s");
      return data;
    } else {
      return data;
    }
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }
}
