import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentsTable } from "./students-table";
import { Student } from "@/features/user/api/use-get-students";
import { Course } from "@/features/course/api/use-get-courses";

export function YearStudents({ data, yearName, yearId }: { yearId: string, yearName: string, data: { students: Student[] | undefined; courses: Course[] | undefined; isPending: boolean; error: Error | null } }) {
    const { students, courses, isPending, error } = data;

    return (
        <Card >
            <CardHeader>
                <CardTitle>Estudiantes</CardTitle>
                <CardDescription>
                    Lista de estudiantes asignados al año {yearName}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div>Cargando estudiantes...</div>
                ) : error ? (
                    <div>Error al cargar los estudiantes: {error.message}</div>
                ) :  (
                    <StudentsTable data={students ?? []} courses={courses ?? []} yearId={yearId} />
                )}
            </CardContent>
        </Card>
    )
}