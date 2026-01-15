import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetCourseSubjects } from "@/features/course-subject/api/use-get-course-subjects";
import { CourseDetails } from "@/features/course/api/use-get-course";
import { Users, BookOpen, MapPin } from "lucide-react";

interface CourseStatsProps {
  course: CourseDetails;
}

export function CourseStats({ course }: CourseStatsProps) {
  const enrollmentsCount = course._count?.enrollments || 0;
  const occupancyPercentage = course.capacity
    ? (enrollmentsCount / course.capacity) * 100
    : 0;

  const { courseSubjects } = useGetCourseSubjects({ courseId: course.id });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Estudiantes Matriculados
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {enrollmentsCount} / {course.capacity}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {course.capacity - enrollmentsCount} cupos disponibles
          </p>
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                occupancyPercentage >= 90
                  ? "bg-red-500"
                  : occupancyPercentage >= 70
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Materias</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {courseSubjects?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {courseSubjects?.filter((s) => s.teacher).length || 0} con profesor
            asignado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aula</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{course.classroom || "—"}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ubicación asignada
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
