import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import { SubjectsAssignmentTable } from "./subjects-assignment-table";
import { CourseDetails } from "@/features/course/api/use-get-course";
import { useGetCourseSubjects } from "@/features/course-subject/api/use-get-course-subjects";

interface CourseSubjectAssignmentSectionProps {
  course: CourseDetails;
}

export function CourseSubjectAssignmentSection({
  course,
}: CourseSubjectAssignmentSectionProps) {
  const { courseSubjects, isPending } = useGetCourseSubjects({
    courseId: course.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Materias del Año
        </CardTitle>
        <CardDescription>
          Gestiona la asignación de profesores a las materias de{" "}
          {course.level?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Cargando materias</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              Espere un instante por favor.
            </p>
          </div>
        ) : courseSubjects && courseSubjects.length > 0 ? (
          <SubjectsAssignmentTable data={courseSubjects} courseId={course.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Sin materias configuradas</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              No hay materias registradas para {course.level?.name}. Primero
              debes crear materias en la sección de administración.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
