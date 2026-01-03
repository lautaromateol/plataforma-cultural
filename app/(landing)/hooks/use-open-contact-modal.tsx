import { create } from "zustand";

interface UseOpenContactModalProps {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useOpenContactModal = create<UseOpenContactModalProps>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false })
}))

