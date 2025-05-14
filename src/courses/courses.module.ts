import { Module} from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CacheModule } from 'src/cache/cache.module';
@Module({
  controllers: [CoursesController],
  providers: [
    CoursesService
  ],
  imports: [
    CacheModule 
  ]
})
export class CoursesModule {}
