"use client"
import { ContactFormWrapper } from "@/app/(landing)/components/contact-form-wrapper"
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
            </>
        )
    }
}