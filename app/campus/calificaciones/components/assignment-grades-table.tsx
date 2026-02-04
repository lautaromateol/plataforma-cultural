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
import { ArrowUpDown, Search, Pencil, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { AssignmentSubmissionGrade } from "@/features/grades/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AssignmentGradesTableProps {
  data: AssignmentSubmissionGrade[]
  isTeacher?: boolean
  onEdit?: (submission: AssignmentSubmissionGrade) => void
}

export function AssignmentGradesTable({ data, isTeacher = false, onEdit }: AssignmentGradesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns: ColumnDef<AssignmentSubmissionGrade>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<AssignmentSubmissionGrade>[] = [
      ...(isTeacher ? [{
        accessorKey: "student.name",
        id: "studentName",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estudiante
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.student.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.student.email}</span>
          </div>
        ),
      }] : []),
      {
        accessorKey: "assignment.title",
        id: "assignmentTitle",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tarea
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => <div className="font-medium max-w-[300px] truncate">{row.original.assignment.title}</div>,
      },
      {
        id: "subject",
        header: "Materia",
        cell: ({ row }: any) => {
          const courseSubject = row.original.assignment.assignmentCourseSubjects[0]?.courseSubject
          const subject = courseSubject?.subject
          if (!subject) return "—"

          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm">{subject.name}</span>
              {courseSubject?.course && (
                <Badge variant="outline" className="w-fit text-xs">
                  {courseSubject.course.name}
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "grade",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Calificación
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => {
          const grade = row.original.grade

          if (grade === null) {
            return <Badge variant="secondary">Sin calificar</Badge>
          }

          return (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {grade.toFixed(1)}<span className="text-muted-foreground text-sm">/10</span>
              </span>
              <Badge variant={grade >= 6 ? "default" : "destructive"}>
                {grade >= 6 ? "Aprobado" : "Desaprobado"}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Fecha de Entrega",
        cell: ({ row }: any) => {
          const date = row.original.submittedAt
          return date ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(date), "d/MM/yyyy HH:mm", { locale: es })}
            </div>
          ) : "—"
        },
      },
      {
        id: "feedback",
        header: "Retroalimentación",
        cell: ({ row }: any) => {
          const feedback = row.original.feedback
          if (!feedback) return "—"

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-help">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {feedback}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[400px]">
                  <p>{feedback}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
    ]

    if (isTeacher && onEdit) {
      baseColumns.push({
        id: "actions",
        header: "Acciones",
        cell: ({ row }: any) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      })
    }

    return baseColumns
  }, [isTeacher, onEdit])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No hay calificaciones de tareas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} calificación(es) en total
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
          <div className="text-sm">
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
    </div>
  )
}
