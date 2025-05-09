import { Get, Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from 'src/auth/dto/createCourse.dto';
import { CacheService } from '../cache/cache.service';
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
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }
}
