"use client";

import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useOpenUploadResource } from "@/features/subject-resource/hooks/use-open-upload-resource";
import { UploadResourceDialog } from "./upload-resource-dialog";

export function UploadResourceDialogWrapper() {
    const { isOpen, close, subjectId } = useOpenUploadResource();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={close}>
            <UploadResourceDialog subjectId={subjectId} />
        </ResponsiveModal>
    );
}
