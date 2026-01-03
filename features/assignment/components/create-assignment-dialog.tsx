"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AssignmentForm } from "./assignment-form";
import { Plus } from "lucide-react";

interface CreateAssignmentDialogProps {
  subjectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateAssignmentDialog({
  subjectId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateAssignmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Entrega
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Entrega</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva entrega
          </DialogDescription>
        </DialogHeader>
        <AssignmentForm
          subjectId={subjectId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
