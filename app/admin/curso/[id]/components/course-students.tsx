import { StudentsTable } from "./students-table";
import { CourseDetails } from "@/features/course/api/use-get-course";
import { useGetEnrollments } from "@/features/enrollment/api/use-get-enrollments";
import { CourseSection } from "./course-section";

interface CourseStudentsProps {
  course: CourseDetails;
}

export function CourseStudents({ course }: CourseStudentsProps) {
  const { enrollments, isPending, error } = useGetEnrollments({
    courseId: course.id,
  });

  return (
    <CourseSection
      title="Estudiantes matriculados"
      isPending={isPending}
      error={error}
      courseName={course.name}
    >
      <StudentsTable
        courseId={course.id}
        yearId={course.yearId}
        data={enrollments ?? []}
      />
    </CourseSection>
  );
}
