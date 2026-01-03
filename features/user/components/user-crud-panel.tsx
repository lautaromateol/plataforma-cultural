"use client"

import * as React from "react"
import { useState } from "react"
import { UserTable } from "./user-table"
import { UserForm } from "./user-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function UserCRUDPanel() {
  const [mode, setMode] = useState<"list" | "add" | "edit">("list")
  const [toEdit, setToEdit] = useState<any>(null)

  const openAdd = () => {
    setMode("add")
    setToEdit(null)
  }

  const openEdit = (user: any) => {
    setMode("edit")
    setToEdit(user)
  }

  const handleDone = () => {
    setMode("list")
    setToEdit(null)
  }

  return (
    <div className="space-y-6">
      {mode === "list" ? (
        <UserTable onEdit={openEdit} onCreate={openAdd} />
      ) : (
        <div className="space-y-4">
          <Button variant="ghost" onClick={handleDone} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
          <UserForm
            initialData={mode === "edit" ? toEdit : undefined}
            onSuccess={handleDone}
          />
        </div>
      )}
    </div>
  )
}

