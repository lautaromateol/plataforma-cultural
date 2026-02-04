import { create } from "zustand"
import { Subject } from "@/features/subject/api/use-get-subjects"

interface UseSubjectDialogStore {
  isOpen: boolean
  levelId: string
  subject: Subject | undefined
  open: (levelId: string, subject?: Subject) => void
  close: () => void
}

export const useOpenSubjectDialog = create<UseSubjectDialogStore>((set) => ({
  isOpen: false,
  levelId: "",
  subject: undefined,
  open: (levelId: string, subject?: Subject) =>
    set({ isOpen: true, levelId, subject }),
  close: () =>
    set({ isOpen: false, levelId: "", subject: undefined }),
}))
