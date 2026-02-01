import { create } from "zustand"
import { Subject } from "@/features/subject/api/use-get-subjects"

interface UseSubjectDialogStore {
  isOpen: boolean
  yearId: string
  subject: Subject | undefined
  open: (yearId: string, subject?: Subject) => void
  close: () => void
}

export const useOpenSubjectDialog = create<UseSubjectDialogStore>((set) => ({
  isOpen: false,
  yearId: "",
  subject: undefined,
  open: (yearId: string, subject?: Subject) =>
    set({ isOpen: true, yearId, subject }),
  close: () =>
    set({ isOpen: false, yearId: "", subject: undefined }),
}))
