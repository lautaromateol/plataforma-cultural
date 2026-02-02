"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { useGetUsers } from "../api/use-get-users"
import { useDeleteUser } from "../api/use-delete-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown,
  Search,
  Users as UsersIcon,
  ShieldCheck,
  X,
  Eye,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectItem } from "@/components/ui/select"

interface UserTableProps {
  onEdit: (user: any) => void
  onCreate: () => void
}

type UserData = {
  id: string
  dni: string
  name: string
  email: string | null
  role: "STUDENT" | "TEACHER" | "ADMIN"
  isVerified: boolean
  firstLogin: boolean
}

export function UserTable({ onEdit, onCreate }: UserTableProps) {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = React.useState<
    "STUDENT" | "TEACHER" | "ADMIN" | ""
  >("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const { users, isPending, error } = useGetUsers({
    role: roleFilter || undefined,
    search: searchTerm || undefined,
  })
  const { deleteUser, isDeletingUser } = useDeleteUser()

  const clearFilters = () => {
    setRoleFilter("")
    setSearchTerm("")
  }

  const hasFilters = roleFilter || searchTerm

  const columns: ColumnDef<UserData>[] = [
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
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-medium text-primary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              {user.firstLogin && (
                <span className="text-xs text-muted-foreground">
                  Primer inicio
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "dni",
      header: "DNI",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.getValue("dni")}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null
        return (
          <span className="text-sm text-muted-foreground">
            {email || "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rol
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        const roleConfig = {
          ADMIN: {
            label: "Administrador",
            variant: "destructive" as const,
            icon: ShieldCheck,
          },
          TEACHER: {
            label: "Profesor",
            variant: "default" as const,
            icon: UsersIcon,
          },
          STUDENT: {
            label: "Estudiante",
            variant: "secondary" as const,
            icon: UsersIcon,
          },
        }
        const config = roleConfig[role as keyof typeof roleConfig]
        const Icon = config?.icon

        return (
          <Badge variant={config?.variant || "secondary"} className="gap-1">
            {Icon && <Icon className="h-3 w-3" />}
            {config?.label || role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isVerified",
      header: "Estado",
      cell: ({ row }) => {
        const isVerified = row.getValue("isVerified") as boolean
        return isVerified ? (
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" />
            Verificado
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            No verificado
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/usuario/${user.id}`)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteUser(user.id)}
              disabled={isDeletingUser}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable<UserData>({
    data: (users || []) as UserData[],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-2xl font-bold">Usuarios</CardTitle>
          <CardDescription>
            Gestiona los usuarios del sistema (estudiantes, profesores y
            administradores)
          </CardDescription>
        </div>
        <Button onClick={onCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            placeholder="Filtrar por rol"
          >
            <SelectItem value="">Todos los roles</SelectItem>
            <SelectItem value="STUDENT">Estudiantes</SelectItem>
            <SelectItem value="TEACHER">Profesores</SelectItem>
            <SelectItem value="ADMIN">Administradores</SelectItem>
          </Select>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} size="sm">
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : !users || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">
              {hasFilters
                ? "No se encontraron usuarios"
                : "No hay usuarios registrados"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {hasFilters
                ? "Intenta cambiar los filtros de búsqueda"
                : "Comienza creando el primer usuario"}
            </p>
            {!hasFilters && (
              <Button onClick={onCreate} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Crear primer usuario
              </Button>
            )}
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
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
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
                  {table.getFilteredRowModel().rows.length} usuario(s) en total
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
      </CardContent>
    </Card>
  )
}
