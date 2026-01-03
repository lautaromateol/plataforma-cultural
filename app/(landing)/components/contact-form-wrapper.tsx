import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useOpenContactModal } from "../hooks/use-open-contact-modal";
import { ContactForm } from "./contact-form";

export function ContactFormWrapper() {

    const { isOpen, close } = useOpenContactModal()

    return (
        <ResponsiveModal open={isOpen} onOpenChange={close}>
            <ContactForm />
        </ResponsiveModal>
    )
}