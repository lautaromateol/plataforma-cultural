"use client"
import { ContactFormWrapper } from "@/app/(landing)/components/contact-form-wrapper"
import { CreateAnnouncementFormWrapper } from "@/features/announcement/components/create-announcement-form-wrapper"
import { UploadResourceDialogWrapper } from "@/app/campus/materia/components/upload-resource-dialog-wrapper"
import { useEffect, useState } from "react"

export function ModalsProvider() {

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (isMounted) {

        return (
            <>
                <ContactFormWrapper />
                <CreateAnnouncementFormWrapper />
                <UploadResourceDialogWrapper />
            </>
        )
    }
}