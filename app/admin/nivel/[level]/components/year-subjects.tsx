import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectsTable } from "./subjects-table";
import { Subject } from "@/features/subject/api/use-get-subjects";

export function YearSubjects({ yearName, data }: { yearName: string, data: { subjects: Subject[] | undefined, isPending: boolean, error: Error | null } }) {
    const { subjects, isPending, error } = data;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Materias</CardTitle>
                <CardDescription>
                    Asignaturas que se dictan en {yearName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending ? (
                    <div>Cargando materias...</div>
                ) : error ? (
                    <div>Error al cargar las materias: {error.message}</div>
                ) : subjects && subjects.length > 0 ? (
                    <SubjectsTable data={subjects} />
                ) : (
                    <div>No hay materias disponibles para este año escolar.</div>
                )}
            </CardContent>
        </Card>
    )
}