"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Search,
  Mail,
  Phone,
  User,
  UserMinus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUnenrollStudent } from "@/features/enrollment/api/use-unenroll-student";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { Enrollment } from "@/features/enrollment/api/use-get-enrollments";

interface StudentsTableProps {
  data: Enrollment[];
  courseId: string;
  levelId: string;
}

export function StudentsTable({ data, courseId, levelId }: StudentsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const { unenrollStudentAsync, isUnenrolling } = useUnenrollStudent({
    levelId,
  });

  const handleUnenroll = async (studentId: string, studentName: string) => {
    if (
      !confirm(`¿Estás seguro de desmatricular a ${studentName} de este curso?`)
    ) {
      return;
    }
    try {
      await unenrollStudentAsync({ studentId, courseId });
      toast.success(`${studentName} fue desmatriculado exitosamente`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al desmatricular estudiante";
      toast.error(message);
    }
  };

  const columns: ColumnDef<Enrollment>[] = [
    {
      accessorKey: "student.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estudiante
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {student.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{student.name}</div>
              <div className="text-xs text-muted-foreground">
                DNI: {student.dni}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "student.email",
      header: "Contacto",
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="space-y-1">
            {student.email && (
              <div className="flex items-center gap-1.5 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{student.email}</span>
              </div>
            )}
            {student.studentProfile?.phone && (
              <div className="flex items-center gap-1.5 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {student.studentProfile.phone}
                </span>
              </div>
            )}
            {!student.email && !student.studentProfile?.phone && (
              <span className="text-muted-foreground text-sm">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "student.studentProfile.guardianName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tutor/Apoderado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const profile = row.original.student.studentProfile;
        return (
          <div className="space-y-1">
            {profile?.guardianName && (
              <div className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{profile.guardianName}</span>
              </div>
            )}
            {profile?.guardianPhone && (
              <div className="flex items-center gap-1.5 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {profile.guardianPhone}
                </span>
              </div>
            )}
            {!profile?.guardianName && !profile?.guardianPhone && (
              <span className="text-muted-foreground text-sm">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "student.studentProfile.address",
      header: "Dirección",
      cell: ({ row }) => {
        const address = row.original.student.studentProfile?.address;
        return (
          <div className="text-muted-foreground text-sm max-w-[200px] truncate">
            {address || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusMap: Record<
          string,
          {
            label: string;
            variant: "default" | "secondary" | "outline" | "destructive";
          }
        > = {
          ACTIVE: { label: "Activo", variant: "default" },
          INACTIVE: { label: "Inactivo", variant: "secondary" },
          GRADUATED: { label: "Graduado", variant: "outline" },
          TRANSFERRED: { label: "Transferido", variant: "destructive" },
        };
        const statusInfo = statusMap[status] || {
          label: status,
          variant: "outline",
        };
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const student = row.original.student;

        return (
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleUnenroll(student.id, student.name)}
                    disabled={isUnenrolling}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Desmatricular estudiante</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

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
    globalFilterFn: (row, columnId, filterValue) => {
      const student = row.original.student;
      const searchableText = [
        student.name,
        student.dni,
        student.email,
        student.studentProfile?.phone,
        student.studentProfile?.guardianName,
        student.studentProfile?.guardianPhone,
        student.studentProfile?.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(filterValue.toLowerCase());
    },
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
  });

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">
          No hay estudiantes matriculados
        </p>
        <p className="text-sm text-muted-foreground">
          Este curso aún no tiene estudiantes asignados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, DNI, email, teléfono, tutor..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9"
          />
        </div>
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
                  );
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
                  No se encontraron estudiantes
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  );
}
