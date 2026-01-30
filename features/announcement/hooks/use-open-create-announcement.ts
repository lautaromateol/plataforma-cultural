import { create } from "zustand";

interface UseOpenCreateAnnouncementProps {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useOpenCreateAnnouncement = create<UseOpenCreateAnnouncementProps>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))

