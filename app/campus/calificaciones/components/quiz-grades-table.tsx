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
  type Column,
  type Row,
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
import { ArrowUpDown, Search, Pencil, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { QuizAttemptGrade } from "@/features/grades/types"

interface QuizGradesTableProps {
  data: QuizAttemptGrade[]
  isTeacher?: boolean
  onEditAnswer?: (answer: QuizAttemptGrade["answers"][0], attemptId: string, studentName: string, quizTitle: string) => void
}

export function QuizGradesTable({ data, isTeacher = false, onEditAnswer }: QuizGradesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const columns: ColumnDef<QuizAttemptGrade>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<QuizAttemptGrade>[] = [
      ...(isTeacher ? [{
        accessorKey: "student.name",
        id: "studentName",
        header: ({ column }: { column: Column<QuizAttemptGrade> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estudiante
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.student.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.student.email}</span>
          </div>
        ),
      }] : []),
      {
        accessorKey: "quiz.title",
        id: "quizTitle",
        header: ({ column }: { column: Column<QuizAttemptGrade> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cuestionario
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => <div className="font-medium max-w-[300px] truncate">{row.original.quiz.title}</div>,
      },
      {
        accessorKey: "quiz.subject.name",
        id: "subjectName",
        header: "Materia",
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => {
          const subject = row.original.quiz.subject
          const courseSubject = subject.courseSubjects?.[0]
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
        accessorKey: "score",
        header: ({ column }: { column: Column<QuizAttemptGrade> }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Calificación
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => {
          const score = row.original.score || 0
          const maxScore = row.original.answers.reduce(
            (sum, answer) => sum + (answer.question.points || 0),
            0
          )
          const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0

          return (
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {score.toFixed(1)}<span className="text-muted-foreground text-sm">/{maxScore}</span>
              </span>
              <Badge variant={percentage >= 60 ? "default" : "destructive"}>
                {percentage.toFixed(0)}%
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "submittedAt",
        header: "Fecha",
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => {
          const date = row.original.submittedAt
          return date ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {format(new Date(date), "d/MM/yyyy", { locale: es })}
            </div>
          ) : "—"
        },
      },
      {
        id: "status",
        header: "Estado",
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => {
          const needsReview = row.original.answers.some((a) => a.needsManualReview)
          return needsReview ? (
            <Badge variant="destructive" className="animate-pulse">
              Requiere revisión
            </Badge>
          ) : (
            <Badge variant="outline">Calificado</Badge>
          )
        },
      },
    ]

    if (isTeacher && onEditAnswer) {
      baseColumns.push({
        id: "actions",
        header: "Acciones",
        cell: ({ row }: { row: Row<QuizAttemptGrade> }) => {
          const textAnswers = row.original.answers.filter((a) => a.question.type === "TEXT")
          if (textAnswers.length === 0) return null

          return (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const answer = textAnswers[0]
                onEditAnswer(answer, row.original.id, row.original.student.name, row.original.quiz.title)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )
        },
      })
    }

    return baseColumns
  }, [isTeacher, onEditAnswer])

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
            placeholder="Buscar cuestionarios..."
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
                  No hay calificaciones de cuestionarios.
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
