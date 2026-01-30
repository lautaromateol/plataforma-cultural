import { create } from "zustand";

interface UseOpenUploadResourceProps {
    subjectId: string;
    isOpen: boolean;
    open: (subjectId: string) => void;
    close: () => void;
}

export const useOpenUploadResource = create<UseOpenUploadResourceProps>((set) => ({
    subjectId: "",
    isOpen: false,
    open: (subjectId: string) => set({ isOpen: true, subjectId }),
    close: () => set({ isOpen: false, subjectId: "" })
}))
