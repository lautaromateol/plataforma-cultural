import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent } from "./drawer"
import { Dialog, DialogContent } from "./dialog";

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: () => void;
    children: React.ReactNode
}

export function ResponsiveModal({ children, onOpenChange, open }: ResponsiveModalProps) {

    const isMobile = useIsMobile()

    return (
        <>
            {isMobile ? (
                <Drawer open={open} onOpenChange={onOpenChange}>
                    <DrawerContent>
                        {children}
                    </DrawerContent>
                </Drawer>
            ) : (
                <Dialog open={open} onOpenChange={onOpenChange}>
                    <DialogContent>
                        {children}
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}