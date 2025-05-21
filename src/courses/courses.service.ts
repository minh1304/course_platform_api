import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Course } from '@prisma/client';
import { CreateCourseDto } from 'src/auth/dto/createCourse.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAllCourses(): Promise<Course[]> {
    return await this.prisma.course.findMany({
      include: {
        sections: {
          include: {
            chapters: true,
          },
        },
        enrollments: {},
      },
    });
  }
  async createCourse(data: CreateCourseDto) {
    return await this.prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      image: data.image,
      price: data.price,
      level: data.level,
      status: data.status,
      teacherId: data.teacherId,
      teacherName: data.teacherName,
      sections: {
        create: data.sections?.map((section) => ({
          sectionTitle: section.sectionTitle,
          sectionDescription: section.sectionDescription,
          chapters: {
            create: section.chapters?.map((chapter) => ({
              type: chapter.type,
              title: chapter.title,
              content: chapter.content,
            })),
          },
        })) || [],
      },
      enrollments: {
        create:
          data.enrollments?.map((enrollment) => ({
            userId: enrollment.userId,
          })) || [],
      },
    },
    include: {
      sections: {
        include: {
          chapters: true,
        },
      },
      enrollments: true,
    },
  });

  }
}
