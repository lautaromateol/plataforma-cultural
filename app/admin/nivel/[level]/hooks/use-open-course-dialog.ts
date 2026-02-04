import { create } from "zustand"
import { Course } from "@/features/course/api/use-get-courses"

interface UseCourseDialogStore {
  isOpen: boolean
  levelId: string
  course: Course | undefined
  open: (levelId: string, course?: Course) => void
  close: () => void
}

export const useOpenCourseDialog = create<UseCourseDialogStore>((set) => ({
  isOpen: false,
  levelId: "",
  course: undefined,
  open: (levelId: string, course?: Course) =>
    set({ isOpen: true, levelId, course }),
  close: () =>
    set({ isOpen: false, levelId: "", course: undefined }),
}))
