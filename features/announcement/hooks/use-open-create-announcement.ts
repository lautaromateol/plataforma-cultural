import { create } from "zustand";

interface UseOpenCreateAnnouncementProps {
    subjectId: string;
    isOpen: boolean;
    open: (subjectId: string) => void;
    close: () => void;
}

export const useOpenCreateAnnouncement = create<UseOpenCreateAnnouncementProps>((set) => ({
    subjectId: "",
    isOpen: false,
    open: (subjectId: string) => set({ isOpen: true, subjectId }),
    close: () => set({ isOpen: false, subjectId: "" })
}))

