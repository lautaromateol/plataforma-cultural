import { create } from "zustand"
import { Course } from "@/features/course/api/use-get-courses"

interface UseCourseDialogStore {
  isOpen: boolean
  yearId: string
  course: Course | undefined
  open: (yearId: string, course?: Course) => void
  close: () => void
}

export const useOpenCourseDialog = create<UseCourseDialogStore>((set) => ({
  isOpen: false,
  yearId: "",
  course: undefined,
  open: (yearId: string, course?: Course) =>
    set({ isOpen: true, yearId, course }),
  close: () =>
    set({ isOpen: false, yearId: "", course: undefined }),
}))
