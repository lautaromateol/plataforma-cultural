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
import { ArrowUpDown, Search, GraduationCap } from "lucide-react"
import { PlanSection } from "./plan-section"
import { StudyPlanDetails } from "@/features/study-plan/api/use-get-study-plan-details"

interface PlanTeachersProps {
  studyPlan: StudyPlanDetails
}

interface TeacherRow {
  id: string
  name: string
  email: string | null
  subjects: string[]
  courses: string[]
}

export function PlanTeachers({ studyPlan }: PlanTeachersProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Extraer profesores únicos de todos los cursos
  const teachers: TeacherRow[] = React.useMemo(() => {
    const teacherMap = new Map<
      string,
      {
        id: string
        name: string
        email: string | null
        subjects: Set<string>
        courses: Set<string>
      }
    >()

    studyPlan.levels?.forEach((level) => {
      level.courses?.forEach((course) => {
        course.courseSubjects?.forEach((cs) => {
          if (cs.teacher) {
            const existing = teacherMap.get(cs.teacher.id)
            if (existing) {
              if (cs.subject?.name) existing.subjects.add(cs.subject.name)
              existing.courses.add(`${level.name} - ${course.name}`)
            } else {
              teacherMap.set(cs.teacher.id, {
                id: cs.teacher.id,
                name: cs.teacher.name,
                email: cs.teacher.email,
                subjects: new Set(cs.subject?.name ? [cs.subject.name] : []),
                courses: new Set([`${level.name} - ${course.name}`]),
              })
            }
          }
        })
      })
    })

    return Array.from(teacherMap.values()).map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      subjects: Array.from(t.subjects),
      courses: Array.from(t.courses),
    }))
  }, [studyPlan])

  const columns: ColumnDef<TeacherRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
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
      accessorKey: "subjects",
      header: "Materias",
      cell: ({ row }) => {
        const subjects = row.getValue("subjects") as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.length > 0 ? (
              subjects.map((subject, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {subject}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "courses",
      header: "Cursos",
      cell: ({ row }) => {
        const courses = row.getValue("courses") as string[]
        return (
          <div className="flex flex-wrap gap-1">
            {courses.length > 0 ? (
              courses.map((course, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {course}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: teachers,
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
      pagination: { pageSize: 10 },
    },
  })

  return (
    <PlanSection
      title="Profesores"
      description={`Docentes que dictan clases en el plan ${studyPlan.name}`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar profesores..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">No hay profesores asignados</p>
            <p className="text-sm text-muted-foreground">
              Este plan aún no tiene profesores asignados a sus cursos
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  {table.getFilteredRowModel().rows.length} profesor(es) en total
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
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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
