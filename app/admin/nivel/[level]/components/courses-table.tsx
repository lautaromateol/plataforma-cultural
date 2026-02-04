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
import { ArrowUpDown, Search, Users, Edit, Trash2 } from "lucide-react"
import { Course } from "@/features/course/api/use-get-courses"
import { useDeleteCourse } from "@/features/course/api/use-delete-course"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CoursesTableProps {
  data: Course[]
  onEdit: (course: Course) => void
  onCreate: () => void
  levelId: string
}

export function CoursesTable({ data, onEdit, onCreate, levelId }: CoursesTableProps) {
  const { deleteCourseAsync, isDeletingCourse } = useDeleteCourse()
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(null)

  const handleDeleteCourse = async (course: Course) => {
    try {
      await deleteCourseAsync(course.id)
      setCourseToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el curso")
    }
  }

  const columns: ColumnDef<Course>[] = [
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
    accessorKey: "academicYear",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Año Académico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.getValue("academicYear")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "classroom",
    header: "Aula",
    cell: ({ row }) => {
      const classroom = row.getValue("classroom") as string | null
      return <div className="text-muted-foreground">{classroom || "—"}</div>
    },
  },
  {
    id: "enrollment",
    header: "Estudiantes",
    cell: ({ row }) => {
      const enrollmentCount = row.original.enrollmentCount
      const capacity = row.original.capacity
      const percentage = (enrollmentCount / capacity) * 100
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {enrollmentCount} / {capacity}
          </span>
          <Badge
            variant={percentage >= 90 ? "destructive" : percentage >= 70 ? "default" : "secondary"}
            className="text-xs"
          >
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      )
    },
  },
  {
    id: "subjects",
    header: "Materias",
    cell: ({ row }) => {
      const subjects = row.original.subjectsCount
      return (
        <div className="text-sm text-muted-foreground">
          {subjects} materia{subjects !== 1 ? "s" : ""}
        </div>
      )
    },
  },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const course = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(course)}
              title="Editar"
              disabled={isDeletingCourse}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCourseToDelete(course)}
              title="Eliminar"
              disabled={isDeletingCourse}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
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
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            onClick={onCreate}
            disabled={isDeletingCourse}
          >
            Crear Curso
          </Button>
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
                    No se encontraron cursos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} curso(s) en total
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
      </div>

      <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el curso "{courseToDelete?.name}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeletingCourse}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => courseToDelete && handleDeleteCourse(courseToDelete)}
            disabled={isDeletingCourse}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletingCourse ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}