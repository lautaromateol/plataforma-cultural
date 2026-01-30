import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useOpenCreateAnnouncement } from "../hooks/use-open-create-announcement";
import { CreateAnnouncementForm } from "./create-announcement-form";

export function CreateAnnouncementFormWrapper() {

    const { isOpen, close, subjectId } = useOpenCreateAnnouncement()

    return(
        <ResponsiveModal open={isOpen} onOpenChange={close}>
            <CreateAnnouncementForm subjectId={subjectId} />
        </ResponsiveModal>
    )
}