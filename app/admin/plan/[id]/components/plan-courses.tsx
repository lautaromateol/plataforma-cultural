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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ArrowUpDown, Search, Users, Edit, Trash2, Plus, School } from "lucide-react"
import { useDeleteCourse } from "@/features/course/api/use-delete-course"
import { useCreateCourse } from "@/features/course/api/use-create-course"
import { useUpdateCourse } from "@/features/course/api/use-update-course"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlanSection } from "./plan-section"
import { StudyPlanDetails } from "@/features/study-plan/api/use-get-study-plan-details"

interface PlanCoursesProps {
  studyPlan: StudyPlanDetails
}

interface CourseRow {
  id: string
  name: string
  academicYear: string
  classroom: string | null
  capacity: number
  enrollmentCount: number
  levelId: string
  levelName: string
}

const courseFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  academicYear: z.string().min(1, "El año académico es requerido"),
  capacity: z.number().min(1, "La capacidad debe ser al menos 1"),
  classroom: z.string().optional(),
  levelId: z.string().min(1, "El nivel es requerido"),
})

type CourseFormData = z.infer<typeof courseFormSchema>

export function PlanCourses({ studyPlan }: PlanCoursesProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingCourse, setEditingCourse] = React.useState<CourseRow | null>(null)
  const [courseToDelete, setCourseToDelete] = React.useState<CourseRow | null>(null)

  const { deleteCourseAsync, isDeletingCourse } = useDeleteCourse()
  const { createCourseAsync, isCreatingCourse } = useCreateCourse()
  const { updateCourseAsync, isUpdatingCourse } = useUpdateCourse()

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      academicYear: new Date().getFullYear().toString(),
      capacity: 30,
      classroom: "",
      levelId: "",
    },
  })

  // Extraer cursos de todos los niveles
  const courses: CourseRow[] = React.useMemo(() => {
    const result: CourseRow[] = []
    studyPlan.levels?.forEach((level) => {
      level.courses?.forEach((course) => {
        result.push({
          id: course.id,
          name: course.name,
          academicYear: course.academicYear,
          classroom: course.classroom,
          capacity: course.capacity,
          enrollmentCount: course._count?.enrollments ?? course.enrollments?.length ?? 0,
          levelId: level.id,
          levelName: level.name,
        })
      })
    })
    return result
  }, [studyPlan])

  const levels = studyPlan.levels ?? []

  const handleOpenCreate = () => {
    setEditingCourse(null)
    form.reset({
      name: "",
      academicYear: new Date().getFullYear().toString(),
      capacity: 30,
      classroom: "",
      levelId: levels[0]?.id ?? "",
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (course: CourseRow) => {
    setEditingCourse(course)
    form.reset({
      name: course.name,
      academicYear: course.academicYear,
      capacity: course.capacity,
      classroom: course.classroom ?? "",
      levelId: course.levelId,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (data: CourseFormData) => {
    try {
      if (editingCourse) {
        await updateCourseAsync({
          id: editingCourse.id,
          data: {
            name: data.name,
            academicYear: data.academicYear,
            capacity: data.capacity,
            classroom: data.classroom,
          },
        })
        toast.success("Curso actualizado exitosamente")
      } else {
        await createCourseAsync(data)
        toast.success("Curso creado exitosamente")
      }
      setDialogOpen(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el curso")
    }
  }

  const handleDelete = async (course: CourseRow) => {
    try {
      await deleteCourseAsync(course.id)
      setCourseToDelete(null)
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el curso")
    }
  }

  const columns: ColumnDef<CourseRow>[] = [
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
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "levelName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nivel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="outline">{row.getValue("levelName")}</Badge>,
    },
    {
      accessorKey: "academicYear",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Año Académico
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="secondary">{row.getValue("academicYear")}</Badge>,
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
        const percentage = capacity > 0 ? (enrollmentCount / capacity) * 100 : 0
        return (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {enrollmentCount} / {capacity}
            </span>
            <Badge
              variant={
                percentage >= 90 ? "destructive" : percentage >= 70 ? "default" : "secondary"
              }
              className="text-xs"
            >
              {percentage.toFixed(0)}%
            </Badge>
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
              onClick={() => handleOpenEdit(course)}
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

  const table = useReactTable({
    data: courses,
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

  const isPending = isCreatingCourse || isUpdatingCourse

  return (
    <PlanSection
      title="Cursos"
      description={`Grupos de estudiantes en el plan ${studyPlan.name}`}
    >
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Crear Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Editar Curso" : "Crear Curso"}</DialogTitle>
                <DialogDescription>
                  {editingCourse
                    ? "Modifica los datos del curso"
                    : "Completa los datos para crear un nuevo curso"}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="levelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel *</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            disabled={isPending || !!editingCourse}
                          >
                            <SelectItem value="">Seleccionar nivel</SelectItem>
                            {levels.map((level) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 1°A, 1°B..." disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año Académico *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 2024"
                            maxLength={4}
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              disabled={isPending}
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value ? Number(e.target.value) : "")
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="classroom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aula</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Aula 101" disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending
                        ? editingCourse
                          ? "Actualizando..."
                          : "Creando..."
                        : editingCourse
                        ? "Actualizar"
                        : "Crear"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <School className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">No hay cursos</p>
            <p className="text-sm text-muted-foreground">
              Comienza creando el primer curso en este plan
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

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={(open) => !open && setCourseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el curso "{courseToDelete?.name}"? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel disabled={isDeletingCourse}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => courseToDelete && handleDelete(courseToDelete)}
            disabled={isDeletingCourse}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletingCourse ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </PlanSection>
  )
}
