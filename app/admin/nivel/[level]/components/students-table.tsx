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
import { ArrowUpDown, Search, UserPlus, UserMinus, AlertCircle } from "lucide-react"
import { useGetUsers } from "@/features/user/api/use-get-users"
import { useEnrollStudent } from "@/features/enrollment/api/use-enroll-student"
import { useUnenrollStudent } from "@/features/enrollment/api/use-unenroll-student"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Student } from "@/features/user/api/use-get-students"
import { Course } from "@/features/course/api/use-get-courses"

interface StudentsTableProps {
  data: Student[] | []
  courses: Course[] | []
  yearId: string
}

export function StudentsTable({ data, courses, yearId }: StudentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [enrollDialogOpen, setEnrollDialogOpen] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<string>("")
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")

  // Obtener todos los estudiantes del sistema
  const { users: allUsers, isPending: isLoadingUsers } = useGetUsers({ role: "STUDENT" })
  const { enrollStudentAsync, isEnrolling } = useEnrollStudent({ yearId })
  const { unenrollStudentAsync, isUnenrolling } = useUnenrollStudent({ yearId })

  // Filtrar estudiantes no matriculados en este año
  const enrolledStudentIds = new Set(data.map(s => s.id))
  const availableStudents = allUsers?.filter(
    (user) => !enrolledStudentIds.has(user.id)
  ) || []

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
      const message = error instanceof Error ? error.message : "Error al matricular estudiante"
      toast.error(message)
    }
  }

  const handleUnenroll = async (studentId: string, courseId: string, studentName: string) => {
    if (!confirm(`¿Desmatricular a ${studentName}?`)) return

    try {
      await unenrollStudentAsync({ studentId, courseId })
      toast.success("Estudiante desmatriculado exitosamente")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al desmatricular estudiante"
      toast.error(message)
    }
  }

  const columns: ColumnDef<Student>[] = [
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
      cell: ({ row }) => <div className="text-muted-foreground font-mono">{row.getValue("dni")}</div>,
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
        return (
          <Badge variant="default">
            {row.getValue("courseName")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "enrollmentStatus",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("enrollmentStatus") as string
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
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
      accessorKey: "studentProfile.guardianName",
      header: "Tutor",
      cell: ({ row }) => {
        const guardianName = row.original.studentProfile?.guardianName
        return <div className="text-muted-foreground text-sm">{guardianName || "—"}</div>
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
              onClick={() => handleUnenroll(student.id, student.courseId, student.name)}
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

  const table = useReactTable<Student>({
    data,
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

        {/* Botón Matricular Estudiante */}
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
                  No hay estudiantes disponibles para matricular. Todos los estudiantes ya están matriculados en este año.
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
                    {courses.map((course) => {
                      const available = course.capacity - course.enrollmentCount
                      const isFull = available <= 0
                      return (
                        <SelectItem
                          key={course.id}
                          value={course.id}
                          disabled={isFull}
                        >
                          {course.name} - {course.academicYear}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron estudiantes matriculados
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
    </div>
  )
}
