import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoursesTable } from "./courses-table";
import { Course } from "@/features/course/api/use-get-courses";

export function YearCourses({ yearName, data }: { yearName: string, data: { courses: Course[] | undefined; isPending: boolean; error: Error | null } }) {
    const { error, isPending, courses } = data
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cursos</CardTitle>
                <CardDescription>
                    Grupos de estudiantes de {yearName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div>Cargando cursos...</div>
                ) : error ? (
                    <div>Error al cargar los cursos: {error.message}</div>
                ) : courses && courses.length > 0 ? (
                    <CoursesTable data={courses} />
                ) : (
                    <div>No hay cursos asignados a este año.</div>
                )}
            </CardContent>
        </Card>
    )
}