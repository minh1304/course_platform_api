import { Get, Controller, Post, Body, UseInterceptors } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from 'src/auth/dto/createCourse.dto';
import { CacheKey, CacheTTL, CacheInterceptor} from '@nestjs/cache-manager';
@UseInterceptors(CacheInterceptor)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return await this.coursesService.getAllCourses();
  }
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.createCourse(createCourseDto);
  }
}
