import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeachersTable } from "./teachers-table";
import { Teacher } from "@/features/user/api/use-get-teachers";


export function YearTeachers({ yearName, data }: { yearName: string, data: { teachers: Teacher[] | undefined; isPending: boolean; error: Error | null } }) {

    const { error, isPending, teachers } = data

    return (
        <Card >
            <CardHeader>
                <CardTitle>Profesores</CardTitle>
                <CardDescription>
                    Docentes que dictan clases en {yearName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div>Cargando profesores...</div>
                ) : error ? (
                    <div>Error al cargar los profesores: {error.message}</div>
                ) : teachers && teachers.length > 0 ? (
                    <TeachersTable data={teachers} />
                ) : (
                    <div>No hay profesores asignados a este año.</div>
                )}
            </CardContent>
        </Card>
    )
}