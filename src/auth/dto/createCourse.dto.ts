export class CreateCourseDto {
    title: string;
    description: string;
    category: string;
    image: string;
    price: number;
    level: string;
    status: string;
    teacherId: string;
    teacherName: string;
    sections: {
        sectionTitle: string;
        sectionDescription: string;
        chapters: {
            type: string;
            title: string;
            content: string;
        }[];
    }[];
    enrollments: {
        userId: string;
    }[];
}
