"use client"
import { ContactFormWrapper } from "@/app/(landing)/components/contact-form-wrapper"
import { CreateAnnouncementFormWrapper } from "@/features/announcement/components/create-announcement-form-wrapper"
import { UploadResourceDialogWrapper } from "@/app/campus/materia/components/upload-resource-dialog-wrapper"
import { CourseDialogWrapper } from "@/app/admin/nivel/[level]/components/course-dialog-wrapper"
import { SubjectDialogWrapper } from "@/app/admin/nivel/[level]/components/subject-dialog-wrapper"
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
                <CourseDialogWrapper />
                <SubjectDialogWrapper />
            </>
        )
    }
}