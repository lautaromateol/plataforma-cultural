import { Level } from "@/features/level/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetCourses } from "@/features/course/api/use-get-courses";
import { useGetSubjects } from "@/features/subject/api/use-get-subjects";
import { useGetStudents } from "@/features/user/api/use-get-students";
import { useGetTeachers } from "@/features/user/api/use-get-teachers";
import { BookOpen, GraduationCap, School, Users } from "lucide-react";

export function LevelStats({ level }: { level: Level }) {
  const { students } = useGetStudents({ levelId: level.id });
  const { courses } = useGetCourses({ levelId: level.id });
  const { subjects } = useGetSubjects({ levelId: level.id });
  const { teachers } = useGetTeachers({ levelId: level.id });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{students?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            Matriculados en el nivel
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profesores</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{teachers?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground">Dictando clases</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cursos</CardTitle>
          <School className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courses?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground">Grupos de estudiantes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Materias</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subjects?.length ?? 0}</div>
          <p className="text-xs text-muted-foreground">Asignaturas del nivel</p>
        </CardContent>
      </Card>
    </div>
  );
}
