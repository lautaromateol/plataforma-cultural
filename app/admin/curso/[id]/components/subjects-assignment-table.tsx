"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AssignTeacherDialog,
} from "@/features/course-subject/components/assign-teacher-dialog";
import type { SubjectInfo } from "@/features/course-subject/components/assign-teacher-form";

// Tipo compatible para la tabla
type SubjectTableData = SubjectInfo;
import {
  UserPlus,
  Pencil,
  Search,
  BookOpen,
  GraduationCap,
  Clock,
  AlertCircle,
} from "lucide-react";

interface SubjectsAssignmentTableProps {
  data: SubjectInfo[] | SubjectTableData[];
  courseId: string;
}

// Columnas de la tabla definidas fuera del componente para evitar recreación
const createColumns = (
  onAssign: (subject: SubjectInfo) => void
): ColumnDef<SubjectInfo>[] => [
  {
    accessorKey: "name",
    header: "Materia",
    cell: ({ row }) => {
      const subject = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{subject.name}</p>
            {subject.code && (
              <p className="text-xs text-muted-foreground font-mono">
                {subject.code}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Profesor Asignado",
    cell: ({ row }) => {
      const teacher = row.original.teacher;
      if (!teacher) {
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-sm">Sin asignar</span>
          </div>
        );
      }

      const initials = teacher.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{teacher.name}</p>
            {teacher.email && (
              <p className="text-xs text-muted-foreground truncate">
                {teacher.email}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Horario",
    cell: ({ row }) => {
      const schedule = row.original.schedule;
      if (!schedule) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{schedule}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    cell: ({ row }) => {
      const hasTeacher = !!row.original.teacher;
      return hasTeacher ? (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <GraduationCap className="h-3 w-3 mr-1" />
          Asignado
        </Badge>
      ) : (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => {
      const subject = row.original;
      const hasTeacher = !!subject.teacher;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={hasTeacher ? "outline" : "default"}
                size="sm"
                onClick={() => onAssign(subject)}
                className="gap-1.5"
              >
                {hasTeacher ? (
                  <>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Editar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Asignar</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hasTeacher
                ? "Editar asignación de profesor"
                : "Asignar profesor a esta materia"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

export function SubjectsAssignmentTable({
  data,
  courseId,
}: SubjectsAssignmentTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenAssignDialog = (subject: SubjectInfo) => {
    setSelectedSubject(subject);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedSubject(null);
    }
  };

  const columns = createColumns(handleOpenAssignDialog);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const assignedCount = data.filter((s) => s.teacher).length;
  const pendingCount = data.length - assignedCount;

  return (
    <div className="space-y-4">
      {/* Stats & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            {assignedCount} asignadas
          </Badge>
          {pendingCount > 0 && (
            <Badge
              variant="outline"
              className="gap-1.5 text-amber-600 border-amber-300"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {pendingCount} pendientes
            </Badge>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar materia..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
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
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-8 w-8" />
                    <p>No se encontraron materias</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Assignment Dialog */}
      <AssignTeacherDialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        subject={selectedSubject}
        courseId={courseId}
      />
    </div>
  );
}
