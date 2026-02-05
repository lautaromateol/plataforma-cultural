import { Header } from "./components/header";
import { EnrollmentProvider, EnrollmentModal } from "@/features/enrollment";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    return (
        <EnrollmentProvider>
            <main className="min-h-screen">
                <Header />
                {children}
                <EnrollmentModal />
            </main>
        </EnrollmentProvider>
    )
}