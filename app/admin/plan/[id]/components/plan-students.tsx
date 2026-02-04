"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowUpDown, Search, UserPlus, UserMinus, AlertCircle, Users } from "lucide-react"
import { useGetUsers } from "@/features/user/api/use-get-users"
import { useEnrollStudent } from "@/features/enrollment/api/use-enroll-student"
import { useUnenrollStudent } from "@/features/enrollment/api/use-unenroll-student"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlanSection } from "./plan-section"
import { StudyPlanDetails } from "@/features/study-plan/api/use-get-study-plan-details"

interface PlanStudentsProps {
  studyPlan: StudyPlanDetails
}

interface StudentRow {
  id: string
  name: string
  email: string | null
  dni: string
  courseName: string
  courseId: string
  levelName: string
  enrollmentStatus: string
}

export function PlanStudents({ studyPlan }: PlanStudentsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [enrollDialogOpen, setEnrollDialogOpen] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<string>("")
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")

  // Extraer estudiantes de todos los niveles y cursos
  const students: StudentRow[] = React.useMemo(() => {
    const result: StudentRow[] = []
    studyPlan.levels?.forEach((level) => {
      level.courses?.forEach((course) => {
        course.enrollments?.forEach((enrollment) => {
          if (enrollment.student) {
            result.push({
              id: enrollment.student.id,
              name: enrollment.student.name,
              email: enrollment.student.email,
              dni: enrollment.student.dni,
              courseName: course.name,
              courseId: course.id,
              levelName: level.name,
              enrollmentStatus: enrollment.status,
            })
          }
        })
      })
    })
    return result
  }, [studyPlan])

  // Obtener todos los cursos del plan
  const allCourses = React.useMemo(() => {
    const courses: Array<{
      id: string
      name: string
      levelName: string
      capacity: number
      enrollmentCount: number
    }> = []
    studyPlan.levels?.forEach((level) => {
      level.courses?.forEach((course) => {
        courses.push({
          id: course.id,
          name: course.name,
          levelName: level.name,
          capacity: course.capacity,
          enrollmentCount: course._count?.enrollments ?? course.enrollments?.length ?? 0,
        })
      })
    })
    return courses
  }, [studyPlan])

  // Obtener todos los estudiantes del sistema
  const { users: allUsers, isPending: isLoadingUsers } = useGetUsers({ role: "STUDENT" })
  const { enrollStudentAsync, isEnrolling } = useEnrollStudent({ studyPlanId: studyPlan.id })
  const { unenrollStudentAsync, isUnenrolling } = useUnenrollStudent({ studyPlanId: studyPlan.id })

  // Filtrar estudiantes no matriculados en este plan
  const enrolledStudentIds = new Set(students.map((s) => s.id))
  const availableStudents =
    allUsers?.filter((user) => !enrolledStudentIds.has(user.id)) || []

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error("Selecciona un estudiante y un curso")
      return
    }

    try {
      await enrollStudentAsync({
        studentId: selectedStudent,
        courseId: selectedCourse,
      })
      toast.success("Estudiante matriculado exitosamente")
      setEnrollDialogOpen(false)
      setSelectedStudent("")
      setSelectedCourse("")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al matricular estudiante"
      toast.error(message)
    }
  }

  const handleUnenroll = async (
    studentId: string,
    courseId: string,
    studentName: string
  ) => {
    if (!confirm(`¿Desmatricular a ${studentName}?`)) return

    try {
      await unenrollStudentAsync({ studentId, courseId })
      toast.success("Estudiante desmatriculado exitosamente")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al desmatricular estudiante"
      toast.error(message)
    }
  }

  const columns: ColumnDef<StudentRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "dni",
      header: "DNI",
      cell: ({ row }) => (
        <div className="text-muted-foreground font-mono">{row.getValue("dni")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null
        return <div className="text-muted-foreground text-sm">{email || "—"}</div>
      },
    },
    {
      accessorKey: "levelName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nivel
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue("levelName")}</Badge>
      },
    },
    {
      accessorKey: "courseName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Curso
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <Badge variant="default">{row.getValue("courseName")}</Badge>
      },
    },
    {
      accessorKey: "enrollmentStatus",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("enrollmentStatus") as string
        const statusMap: Record<
          string,
          { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
        > = {
          ACTIVE: { label: "Activo", variant: "default" },
          INACTIVE: { label: "Inactivo", variant: "secondary" },
          GRADUATED: { label: "Graduado", variant: "outline" },
          TRANSFERRED: { label: "Transferido", variant: "destructive" },
        }
        const statusInfo = statusMap[status] || { label: status, variant: "outline" }
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const student = row.original
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleUnenroll(student.id, student.courseId, student.name)
              }
              disabled={isUnenrolling}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <UserMinus className="h-4 w-4" />
              Desmatricular
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable<StudentRow>({
    data: students,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <PlanSection
      title="Estudiantes Matriculados"
      description={`Lista de estudiantes matriculados en el plan ${studyPlan.name}`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudiantes..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Matricular Estudiante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Matricular Estudiante</DialogTitle>
                <DialogDescription>
                  Selecciona un estudiante existente y el curso donde matricularlo
                </DialogDescription>
              </DialogHeader>

              {isLoadingUsers ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : availableStudents.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay estudiantes disponibles para matricular.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estudiante</label>
                    <Select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                      <SelectItem value="">Seleccionar estudiante</SelectItem>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.dni})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Curso</label>
                    <Select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <SelectItem value="">Seleccionar curso</SelectItem>
                      {allCourses.map((course) => {
                        const available = course.capacity - course.enrollmentCount
                        const isFull = available <= 0
                        return (
                          <SelectItem
                            key={course.id}
                            value={course.id}
                            disabled={isFull}
                          >
                            {course.levelName} - {course.name}
                            {isFull
                              ? " (Lleno)"
                              : ` (${available} lugares disponibles)`}
                          </SelectItem>
                        )
                      })}
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEnrollDialogOpen(false)}
                  disabled={isEnrolling}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling || !selectedStudent || !selectedCourse}
                >
                  {isEnrolling ? "Matriculando..." : "Matricular"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">No hay estudiantes matriculados</p>
            <p className="text-sm text-muted-foreground">
              Comienza matriculando el primer estudiante en este plan
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No se encontraron resultados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} estudiante(s) en total
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PlanSection>
  )
}
